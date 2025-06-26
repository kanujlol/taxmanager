from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate
from django.db import connection, transaction
from django.shortcuts import redirect
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.core.mail import send_mail
from django.core.cache import cache
from django.conf import settings
from rest_framework.permissions import AllowAny
import random
       
class TrackingPageView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            print("Session ID: ", request.session.session_key)   # no session id as we are using JWT Auth.
            print("Authenticated User: ", user.username)
            cursor = connection.cursor()
            cursor.execute("""
            SELECT salary, salary_tax, property, property_tax, stocks, stocks_tax 
            FROM direct_tax 
            WHERE user_name = %s
        """, [user.username])
            direct_tax_data = cursor.fetchone()

            cursor.execute("""
            SELECT municipal, municipal_taxes, expenses, gst 
            FROM indirect_tax 
            WHERE user_name = %s
        """, [user.username])
            indirect_tax_data = cursor.fetchone() 

            data = {
                "direct_tax": {
                    "salary": direct_tax_data[0],
                    "salary_tax": direct_tax_data[1],
                    "property": direct_tax_data[2],
                    "property_tax": direct_tax_data[3],
                    "stocks": direct_tax_data[4],
                    "stocks_tax": direct_tax_data[5]
                },
                "indirect_tax": {
                    "municipal": indirect_tax_data[0],
                    "municipal_taxes": indirect_tax_data[1],
                    "expenses": indirect_tax_data[2],
                    "gst": indirect_tax_data[3]
                }
            }
            return Response(data, status=status.HTTP_200_OK)
        
class AddDataView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def salary_tax(self, salary):
        slabs = [
            (300000, 0.00),
            (600000, 0.05),
            (900000, 0.10),
            (1200000, 0.15),
            (1500000, 0.20),
            (float('inf'), 0.30)
        ]

        tax = 0
        previous_limit = 0
        for limit, rate in slabs:
            if salary > limit:
                tax += (limit - previous_limit) * rate
                previous_limit = limit
            else:
                tax += (salary - previous_limit) * rate
                break

        return tax

    def property_tax(self, property_value):
        net_property_income = property_value * 0.70
        return self.salary_tax(net_property_income)

    def stocks_tax(self, stocks_value):
        exempt = 100000
        taxable = max(0, stocks_value - exempt)
        return taxable * 0.10

    def municipal_taxes(self, municipal_value):
        return municipal_value * 0.05    
    
    def gst(self, expenses):
        return expenses * 0.18 
    
    def post(self, request):
        user = request.user

        if not user.is_authenticated:
            return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            salary = request.data.get("salary", 0)
            property = request.data.get("property", 0)
            stocks = request.data.get("stocks", 0)
            municipal = request.data.get("municipal", 0)
            expenses = request.data.get("expenses", 0)

            if salary < 0 or property < 0 or stocks < 0 or municipal < 0 or expenses < 0:
                return Response({"error": "Please enter non-negative values"}, status=status.HTTP_400_BAD_REQUEST)


            if salary + property + stocks < 700000:
                salary_tax = property_tax = stocks_tax = 0
            else:
                salary_tax = self.salary_tax(salary)
                property_tax = self.property_tax(property)
                stocks_tax = self.stocks_tax(stocks)

            municipal_tax = self.municipal_taxes(municipal)
            gst = self.gst(expenses)

            try:
                with transaction.atomic():
                    with connection.cursor() as cursor:
                        cursor.execute("""
                            UPDATE direct_tax
                            SET salary = salary + %s, salary_tax = salary_tax + %s, property = property + %s, property_tax = property_tax + %s, 
                                stocks = stocks + %s, stocks_tax = stocks_tax + %s
                            WHERE user_name = %s
                        """, [salary, salary_tax, property, property_tax, stocks, stocks_tax, user.username])

                        cursor.execute("""
                            UPDATE indirect_tax
                            SET municipal = municipal + %s, municipal_taxes = municipal_taxes + %s, expenses = expenses + %s, gst = gst + %s
                            WHERE user_name = %s
                        """, [municipal, municipal_tax, expenses, gst, user.username])

                        return Response({"message": "Tax data updated successfully"}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ClearDataView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        
        if not user.is_authenticated:
            return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            with transaction.atomic():
                cursor = connection.cursor()
                cursor.execute("""
                    UPDATE direct_tax 
                    SET salary = 0, salary_tax = 0, property = 0, property_tax = 0, 
                        stocks = 0, stocks_tax = 0 
                    WHERE user_name = %s
                """, [user.username])

                # Clear the indirect tax values
                cursor.execute("""
                    UPDATE indirect_tax 
                    SET municipal = 0, municipal_taxes = 0, expenses = 0, gst = 0 
                    WHERE user_name = %s
                """, [user.username])

                return Response({"message": "Tax data cleared successfully."}, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SendOtpView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=400)
        
        otp = str(random.randint(100000, 999999))
        cache.set(f"otp_{email}", otp, timeout=300)  # 5 mins

        send_mail(
            'Your OTP Code',
            f'Your OTP is {otp}',
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )
        return Response({"message": "OTP sent successfully"}, status=200)

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")

        if not email or not otp:
            return Response({"error": "Email and OTP are required"}, status=400)

        stored_otp = cache.get(f"otp_{email}")
        if stored_otp is None:
            return Response({"error": "OTP expired or not sent"}, status=400)

        if stored_otp != otp:
            return Response({"error": "Invalid OTP"}, status=400)

        cache.set(f"otp_{email}_verified", True, timeout=300)  
        return Response({"message": "OTP verified"}, status=200)

class RegisterAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        data = request.data
        print("Register API data received:", data)
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")
        full_name = data.get("full_name")

        if not cache.get(f"otp_{email}"):
            return Response({"error": "OTP not verified"}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=400)

        try:
            with transaction.atomic():
                cursor = connection.cursor()
                cursor.execute("SELECT * FROM user_profile WHERE email = %s", [email])
                if cursor.fetchone():
                    return JsonResponse({"error": "Email already in use"}, status=400)

                cursor.execute("SELECT * FROM user_profile WHERE user_name = %s", [username])
                if cursor.fetchone():
                    return JsonResponse({"error": "Username already exists"}, status=400)

                user = User.objects.create_user(username=username, password=password, email=email)
                user.first_name = full_name
                user.save()
                cursor.execute("INSERT INTO user_profile (user_name, name, email) VALUES (%s, %s, %s)", [username, full_name, email])
                cursor.execute("INSERT INTO direct_tax (user_name, salary, salary_tax, property, property_tax, stocks, stocks_tax) VALUES (%s, 0, 0, 0, 0, 0, 0)", [username])
                cursor.execute("INSERT INTO indirect_tax (user_name, municipal, municipal_taxes, expenses, gst) VALUES (%s, 0, 0, 0, 0)", [username])
            
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'username': user.username,
                'message': 'Registration successful'
            }, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

class LoginAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'username': user.username,
                'message': 'Login successful'
            }, status=200)
        return Response({'error': 'Invalid username or password'}, status=400)

class ForgotPasswordAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email required"}, status=400)

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"error": "User not found"}, status=404)

        otp = str(random.randint(100000, 999999))
        cache.set(f"reset_otp_{email}", otp, timeout=300)

        send_mail(
            'Password Reset OTP',
            f'Your password reset OTP is {otp}',
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )
        return Response({"message": "Reset OTP sent"}, status=200)

class ResetPasswordAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        new_password = request.data.get("new_password")

        cached_otp = cache.get(f"reset_otp_{email}")
        if cached_otp != otp:
            return Response({"error": "Invalid OTP"}, status=400)

        user = User.objects.filter(email=email).first()
        if user:
            user.set_password(new_password)
            user.save()
            cache.delete(f"reset_otp_{email}")
            return Response({"message": "Password reset successful"}, status=200)
        return Response({"error": "User not found"}, status=404)
