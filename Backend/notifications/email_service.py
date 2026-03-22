from flask_mail import Message
from flask import current_app
from notifications import mail

def send_patient_confirmation(patient, doctor):
    """Sends doctor details to the patient after selection."""
    try:
        msg = Message(
            "Healthcare Provider Contact Information",
            recipients=[patient.email],
            body=f"""
Hello {patient.name},

Your mental health support assistant has detected a potential crisis. As per your selection, we are sharing the contact details of a professional who can help you further:

Doctor: {doctor.name}
Specialization: {doctor.specialization}
Clinic: {doctor.clinic_name}
Address: {doctor.address}
Phone: {doctor.phone}
Email: {doctor.email}

You can find their location here: {doctor.maps_url if doctor.maps_url else "Contact via phone for location"}

Please reach out to them as soon as possible. Remember, you're not alone.

Best regards,
Sia, your Mental Health Assistant
            """
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f"FAILED TO SEND PATIENT EMAIL: {e}")
        return False

def send_doctor_alert(doctor, patient, alert):
    """Sends patient details and alert context to the doctor."""
    try:
        msg = Message(
            f"URGENT: Mental Health Alert for Patient {patient.name}",
            recipients=[doctor.email],
            body=f"""
Dear {doctor.name},

This is an automated alert from the Mental Health Chatbot system. A patient has identified you as their preferred contact after a critical mental health assessment.

PATIENT DETAILS:
Name: {patient.name}
Email: {patient.email}
Phone: {patient.phone or "Not provided"}

ALERT DETAILS:
Risk Level: {alert.risk_level}
Reason: {alert.reason}
Time: {alert.triggered_at.strftime('%Y-%m-%d %H:%M:%S')}

Please review this information and reach out to the patient at your earliest convenience.

Best regards,
Automated Alert System
            """
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f"FAILED TO SEND DOCTOR EMAIL: {e}")
        return False

def send_verification_email(user):
    """Sends a 6-digit OTP to the user after registration."""
    try:
        msg = Message(
            "Verify Your Aurora Account",
            recipients=[user.email],
            body=f"""
Hello {user.name},

Thank you for joining Aurora. To complete your registration, please use the following 6-digit verification code:

Verification Code: {user.otp_code}

Please enter this code on the registration page to verify your account.

If you did not create an account with us, please ignore this email.

Best regards,
The Aurora Team
            """
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f"FAILED TO SEND VERIFICATION EMAIL: {e}")
        return False

def send_reset_otp_email(user, otp):
    """Sends a 6-digit OTP to the user for password reset."""
    try:
        msg = Message(
            "Password Reset OTP - Aurora",
            recipients=[user.email],
            body=f"""
Hello {user.name},

You have requested to reset your password for your Aurora account. Please use the following 6-digit verification code:

Verification Code: {otp}

Enter this code on the password reset page to proceed.

If you did not request a password reset, please ignore this email or contact support if you have concerns about your account security.

Best regards,
The Aurora Team
            """
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f"FAILED TO SEND RESET EMAIL: {e}")
        return False
