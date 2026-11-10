// Module gửi email qua Gmail SMTP sử dụng Nodemailer
import nodemailer from "nodemailer";

const smtpUser = process.env.SMTP_USER || "khoanv249@gmail.com";
// Loại bỏ khoảng trắng nếu mật khẩu ứng dụng Google được dán theo dạng "xxxx xxxx xxxx xxxx"
const smtpPass = (process.env.SMTP_PASS || "fmiajisatiitvynk").replace(/\s+/g, "");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

/**
 * Gửi email chứa mã xác thực OTP 6 số đến người dùng
 */
export async function sendOtpEmail(toEmail: string, otpCode: string): Promise<boolean> {
  try {
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #2563eb; font-size: 26px; font-weight: 800; margin: 0;">⚡ QuickQuiz</h1>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Nền tảng Luyện Thi Trắc Nghiệm Thông Minh</p>
        </div>

        <div style="background-color: #ffffff; padding: 28px; border-radius: 14px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <h2 style="color: #0f172a; font-size: 18px; font-weight: 700; margin-top: 0;">Xác Thực Đặt Lại Mật Khẩu</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Chào bạn, chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với email <strong>${toEmail}</strong>.
          </p>
          <p style="color: #475569; font-size: 14px; margin-bottom: 12px;">
            Dưới đây là mã xác thực OTP 6 chữ số của bạn:
          </p>

          <div style="text-align: center; margin: 24px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%); border: 2px dashed #3b82f6; border-radius: 12px; padding: 14px 28px;">
              <span style="font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #1d4ed8;">${otpCode}</span>
            </div>
          </div>

          <p style="color: #dc2626; font-size: 12px; font-weight: 600; text-align: center; margin: 0;">
            ⏱️ Mã OTP này có hiệu lực trong vòng 5 phút.
          </p>
          <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-top: 16px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
            Nếu bạn không yêu cầu hành động này, vui lòng bỏ qua email hoặc thông báo ngay cho quản trị viên. Tuyệt đối không chia sẻ mã này cho người khác.
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 11px;">
          © 2026 QuickQuiz. Mọi quyền được bảo lưu.
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"QuickQuiz Security" <${smtpUser}>`,
      to: toEmail,
      subject: `[QuickQuiz] Mã OTP đặt lại mật khẩu: ${otpCode}`,
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error("Lỗi khi gửi email OTP:", error);
    return false;
  }
}
