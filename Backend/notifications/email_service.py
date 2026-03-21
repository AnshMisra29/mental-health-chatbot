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

You can find their location here: {f"https://maps.google.com/?q={doctor.latitude},{doctor.longitude}" if doctor.latitude else "Contact via phone for location"}

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
