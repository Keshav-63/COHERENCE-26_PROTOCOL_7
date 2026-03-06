"""
Email Service
Sends invitation emails to state/minister admins
"""

import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from datetime import datetime

from app.core.config import settings


class EmailService:
    """Service for sending emails"""

    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.FROM_EMAIL or settings.SMTP_USER
        self.from_name = settings.FROM_NAME

    async def send_invitation_email(
        self,
        to_email: str,
        tenant_name: str,
        tenant_type: str,
        dashboard_url: str,
        temporary_password: str,
        expires_at: datetime
    ) -> bool:
        """
        Send invitation email with dashboard URL and temporary password

        Args:
            to_email: Recipient email address
            tenant_name: Name of the tenant (state/ministry)
            tenant_type: Type of tenant
            dashboard_url: Full dashboard URL with hash
            temporary_password: Temporary password for first login
            expires_at: Expiration date of invitation

        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            # Create email content
            subject = f"Invitation to Budget Intelligence Platform - {tenant_name}"

            html_content = self._create_invitation_html(
                to_email=to_email,
                tenant_name=tenant_name,
                tenant_type=tenant_type,
                dashboard_url=dashboard_url,
                temporary_password=temporary_password,
                expires_at=expires_at
            )

            text_content = self._create_invitation_text(
                to_email=to_email,
                tenant_name=tenant_name,
                tenant_type=tenant_type,
                dashboard_url=dashboard_url,
                temporary_password=temporary_password,
                expires_at=expires_at
            )

            # Send email
            return await self._send_email(
                to_email=to_email,
                subject=subject,
                html_content=html_content,
                text_content=text_content
            )

        except Exception as e:
            print(f"Error sending invitation email: {str(e)}")
            return False

    def _create_invitation_html(
        self,
        to_email: str,
        tenant_name: str,
        tenant_type: str,
        dashboard_url: str,
        temporary_password: str,
        expires_at: datetime
    ) -> str:
        """Create HTML email content"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #4A90E2; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 30px; background-color: #f9f9f9; }}
                .credentials {{ background-color: #fff; padding: 20px; border-left: 4px solid #4A90E2; margin: 20px 0; }}
                .button {{ display: inline-block; padding: 12px 30px; background-color: #4A90E2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .warning {{ color: #e74c3c; font-weight: bold; }}
                .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
                .code {{ font-family: monospace; background-color: #f4f4f4; padding: 2px 6px; border-radius: 3px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Budget Intelligence Platform</h1>
                    <p>National Budget Flow & Leakage Detection</p>
                </div>

                <div class="content">
                    <h2>Welcome, {tenant_name}!</h2>

                    <p>You have been invited to join the <strong>National Budget Intelligence Platform</strong> as a <strong>{tenant_type.replace('_', ' ').title()}</strong> administrator.</p>

                    <div class="credentials">
                        <h3>🔐 Your Login Credentials</h3>
                        <p><strong>Email:</strong> {to_email}</p>
                        <p><strong>Temporary Password:</strong> <span class="code">{temporary_password}</span></p>
                        <p><strong>Dashboard URL:</strong><br>
                        <a href="{dashboard_url}" class="button">Access Dashboard</a></p>
                    </div>

                    <h3>📋 Important Instructions:</h3>
                    <ol>
                        <li>Click the button above or copy the URL to access your dashboard</li>
                        <li>Login using your email and the temporary password provided</li>
                        <li><strong>After first login, you MUST generate SSH keys:</strong>
                            <ul>
                                <li>Open terminal/command prompt</li>
                                <li>Run: <span class="code">ssh-keygen -t ed25519 -C "your_email@example.com"</span></li>
                                <li>Or for RSA: <span class="code">ssh-keygen -t rsa -b 4096 -C "your_email@example.com"</span></li>
                                <li>Upload your <strong>public key</strong> (id_ed25519.pub or id_rsa.pub) via dashboard</li>
                                <li><span class="warning">Keep your private key secure - NEVER share it!</span></li>
                            </ul>
                        </li>
                        <li>All API requests must be signed with your private key for security</li>
                    </ol>

                    <h3>⏰ Invitation Validity</h3>
                    <p>This invitation expires on: <strong>{expires_at.strftime('%B %d, %Y at %I:%M %p')}</strong></p>

                    <h3>🔒 Security Notice</h3>
                    <p class="warning">
                        ⚠️ Do not share your temporary password or private key with anyone.<br>
                        ⚠️ The dashboard URL contains a unique hash - keep it secure.<br>
                        ⚠️ You will be required to upload your public key before accessing any data.
                    </p>
                </div>

                <div class="footer">
                    <p>This is an automated email from the National Budget Intelligence Platform.</p>
                    <p>For support, contact your system administrator.</p>
                    <p>&copy; {datetime.now().year} Budget Intelligence Platform. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

    def _create_invitation_text(
        self,
        to_email: str,
        tenant_name: str,
        tenant_type: str,
        dashboard_url: str,
        temporary_password: str,
        expires_at: datetime
    ) -> str:
        """Create plain text email content"""
        return f"""
Budget Intelligence Platform - Invitation

Welcome, {tenant_name}!

You have been invited to join the National Budget Intelligence Platform as a {tenant_type.replace('_', ' ').title()} administrator.

--- YOUR LOGIN CREDENTIALS ---
Email: {to_email}
Temporary Password: {temporary_password}
Dashboard URL: {dashboard_url}

--- IMPORTANT INSTRUCTIONS ---

1. Access your dashboard using the URL above
2. Login with your email and temporary password
3. Generate SSH keys (REQUIRED after first login):
   - Run: ssh-keygen -t ed25519 -C "your_email@example.com"
   - Or for RSA: ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
   - Upload your public key (id_ed25519.pub or id_rsa.pub) via dashboard
   - KEEP YOUR PRIVATE KEY SECURE - NEVER SHARE IT!

4. All API requests must be signed with your private key

--- INVITATION VALIDITY ---
Expires on: {expires_at.strftime('%B %d, %Y at %I:%M %p')}

--- SECURITY NOTICE ---
⚠️ Do not share your temporary password or private key
⚠️ Keep the dashboard URL secure
⚠️ Public key upload is required before accessing data

---
This is an automated email from the National Budget Intelligence Platform.
© {datetime.now().year} Budget Intelligence Platform. All rights reserved.
        """

    async def _send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: str
    ) -> bool:
        """
        Send email via SMTP

        Args:
            to_email: Recipient email
            subject: Email subject
            html_content: HTML content
            text_content: Plain text content

        Returns:
            True if sent successfully
        """
        try:
            # If SMTP not configured, print to console (dev mode)
            if not self.smtp_user or not self.smtp_password:
                print("\n" + "="*80)
                print("📧 EMAIL (SMTP NOT CONFIGURED - DEV MODE)")
                print("="*80)
                print(f"To: {to_email}")
                print(f"Subject: {subject}")
                print("-"*80)
                print(text_content)
                print("="*80 + "\n")
                return True

            # Create message
            message = MIMEMultipart('alternative')
            message['From'] = f"{self.from_name} <{self.from_email}>"
            message['To'] = to_email
            message['Subject'] = subject

            # Add both plain text and HTML
            part1 = MIMEText(text_content, 'plain')
            part2 = MIMEText(html_content, 'html')
            message.attach(part1)
            message.attach(part2)

            # Send email
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_user,
                password=self.smtp_password,
                start_tls=True
            )

            return True

        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False


# Singleton instance
email_service = EmailService()
