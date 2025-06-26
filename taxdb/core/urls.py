from django.urls import path
from .views import RegisterAPIView, LoginAPIView, TrackingPageView, AddDataView, ClearDataView, SendOtpView, VerifyOTPView, ForgotPasswordAPIView, ResetPasswordAPIView

urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('tracking/', TrackingPageView.as_view(), name='tracking_page'),
    path('add-data/', AddDataView.as_view(), name='add_data'),
    path('clear-data/',ClearDataView.as_view(), name='clear_data'),
    path('send-otp/', SendOtpView.as_view(), name='send-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('forgot-password/', ForgotPasswordAPIView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordAPIView.as_view(), name='reset-password'),
]
