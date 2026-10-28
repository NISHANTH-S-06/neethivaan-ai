import sys
import os
import uuid
import random
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal, engine
from backend.models import User, Complaint, Notification, AuditLog, Base

def generate_demo_data():
    db = SessionLocal()
    try:
        # Get existing users
        admin = db.query(User).filter(User.email == "admin@neethivaan.com").first()
        lawyer = db.query(User).filter(User.email == "lawyer@neethivaan.com").first()
        citizen = db.query(User).filter(User.email == "test@example.com").first()

        if not citizen or not admin or not lawyer:
            print("Please run backend.create_test_users first to seed base users.")
            return

        print("Generating Complaints...")
        
        # Determine starting case ID
        latest_count = db.query(Complaint).count()
        start_id = latest_count + 1

        complaints_data = [
            {
                "title": "Property Dispute due to illegal encroachment",
                "description": "My neighbor has built a fence 5 feet into my property line. I have the property deed and surveyor documents to prove my ownership.",
                "issue_type": "Civil Dispute",
                "status": "SUBMITTED",
                "ai_answer": "Based on the details provided, this appears to be a case of property encroachment. Recommended action is to send a legal notice to the neighbor and file a civil injunction.",
                "ai_context": "Property Law: Sections governing boundary disputes and encroachment."
            },
            {
                "title": "Consumer Fraud by Online Retailer",
                "description": "I purchased an electronic gadget online for ₹50,000, but I received a defective product. The company is now refusing to honor the warranty or provide a refund.",
                "issue_type": "Consumer Protection",
                "status": "REVIEWING",
                "ai_answer": "This qualifies as 'deficiency in service' under the Consumer Protection Act. The consumer can approach the District Consumer Disputes Redressal Commission.",
                "ai_context": "Consumer Protection Act: Provisions for defective goods and return policies."
            },
            {
                "title": "Unfair Labor Practice and Unpaid Wages",
                "description": "My previous employer has withheld 3 months of my salary despite me completing my notice period as per the employment contract.",
                "issue_type": "Labor & Employment",
                "status": "PROCESSED",
                "ai_answer": "Withholding salary constitutes an unfair labor practice. A legal notice can be issued under the Industrial Disputes Act or applicable Shops and Establishments Act.",
                "ai_context": "Labor Law: Wage protection and rights of employees during termination."
            },
            {
                "title": "Cyberbullying and Harassment",
                "description": "An anonymous user has been sending me threatening messages and posting morphed images of me on social media platforms.",
                "issue_type": "Cybercrime",
                "status": "SUBMITTED",
                "ai_answer": "This is a serious offense under the Information Technology Act. Immediate action should include filing an FIR with the Cyber Crime Cell and reporting the content on the platforms.",
                "ai_context": "IT Act (Section 66E, 67, 67A): Penalties for violation of privacy and publishing obscene material."
            },
            {
                "title": "Medical Negligence resulting in severe complications",
                "description": "A surgery performed at XYZ hospital last month was botched, leading to an infection and prolonged hospitalization. The hospital is denying any responsibility.",
                "issue_type": "Medical Malpractice",
                "status": "CLOSED",
                "ai_answer": "Medical negligence can be pursued through the Consumer Courts or Civil Courts. Essential evidence includes medical records, expert opinions, and documentation of all expenses incurred.",
                "ai_context": "Tort Law/Consumer Protection: Establishing duty of care, breach of duty, and causation in medical negligence cases."
            }
        ]

        for i, c_data in enumerate(complaints_data):
            case_id = f"CASE-{(start_id + i):06d}"
            
            # Check if case exists to avoid duplicates (optional, but safe)
            existing_complaint = db.query(Complaint).filter(Complaint.title == c_data["title"]).first()
            if existing_complaint:
                print(f"Complaint '{c_data['title']}' already exists, skipping.")
                continue
                
            complaint = Complaint(
                id=str(uuid.uuid4()),
                case_id=case_id,
                user_id=citizen.id,
                title=c_data["title"],
                description=c_data["description"],
                issue_type=c_data["issue_type"],
                complainant_name=citizen.full_name or citizen.email,
                email=citizen.email,
                phone="9876543210",
                status=c_data["status"],
                ai_answer=c_data["ai_answer"],
                ai_context=c_data["ai_context"],
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 10))
            )
            db.add(complaint)

        print("Generating Notifications...")
        notifications = [
            f"Your case regarding Property Dispute has been successfully submitted.",
            f"An AI preliminary analysis is available for your recent case.",
            f"Your Consumer Fraud case status has been updated to REVIEWING.",
            f"An Admin has reviewed your Medical Negligence case and marked it as CLOSED.",
            f"You have a new message from assigned Lawyer regarding Unpaid Wages case."
        ]

        for msg in notifications:
            # Prevent spamming the same test data
            existing_notif = db.query(Notification).filter(Notification.message == msg).first()
            if not existing_notif:
                notif = Notification(
                    id=str(uuid.uuid4()),
                    user_id=citizen.id,
                    message=msg,
                    is_read=random.choice([True, False]),
                    created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 48))
                )
                db.add(notif)


        print("Generating Audit Logs...")
        audit_actions = [
            ("LOGIN", "user", "citizen_login"),
            ("VIEW_CASE", "complaint", "view_details"),
            ("UPDATE_COMPLAINT_STATUS", "complaint", "status_change"),
            ("AI_ANALYSIS_GENERATED", "complaint", "ai_trigger"),
            ("UPLOAD_DOCUMENT", "attachment", "doc_upload")
        ]

        for idx, (action, target_type, extra) in enumerate(audit_actions):
            # Check length to prevent infinite growth
            existing_logs = db.query(AuditLog).filter(AuditLog.action == action).count()
            if existing_logs > 5:
                 continue
                 
            log = AuditLog(
                id=str(uuid.uuid4()),
                action=action,
                target_type=target_type,
                target_id=f"demo-target-{idx}",
                actor_id=admin.id if "UPDATE" in action else citizen.id,
                actor_name=admin.full_name if "UPDATE" in action else citizen.full_name,
                actor_role=admin.role if "UPDATE" in action else citizen.role,
                extra_metadata=f'{{"demo": "{extra}", "system_generated": true}}',
                timestamp=datetime.utcnow() - timedelta(hours=random.randint(1, 24))
            )
            db.add(log)
            
            
        # Admin Notifications setup
        admin_notifications = [
            "A new lawyer registration is pending your approval.",
            "System backup completed successfully.",
            "High priority case CASE-000001 requires admin attention.",
            "Platform user signups increased by 15% this week."
        ]
        
        for msg in admin_notifications:
            existing_notif = db.query(Notification).filter(Notification.message == msg, Notification.user_id == admin.id).first()
            if not existing_notif:
                 notif = Notification(
                      id=str(uuid.uuid4()),
                      user_id=admin.id,
                      message=msg,
                      is_read=random.choice([True, False]),
                      created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 24))
                 )
                 db.add(notif)
                 
        db.commit()
        print("Demo data generation complete! Portals are ready for recording.")

    except Exception as e:
        print(f"Error generating demo data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    generate_demo_data()
