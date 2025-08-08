package com.example.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${GMAIL_USERNAME}")
    private String fromEmail;
    
    /**
     * 송금 한도 요청 승인/반려 알림 이메일 발송
     */
    public void sendRemittanceLimitNotification(String toEmail, String userName, String status, String comment) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("송금 한도 요청 " + (status.equals("APPROVED") ? "승인" : "반려") + " 알림");
            helper.setText(createHtmlEmailContent(userName, status, comment), true); // HTML 모드
            
            mailSender.send(message);
            System.out.println("이메일 발송 성공: " + toEmail + " - " + status);
        } catch (MessagingException e) {
            System.err.println("이메일 발송 실패: " + e.getMessage());
            throw new RuntimeException("이메일 발송 실패: " + e.getMessage(), e);
        }
    }
    
    /**
     * HTML 이메일 내용 생성
     */
    private String createHtmlEmailContent(String userName, String status, String comment) {
        String statusText = status.equals("APPROVED") ? "승인" : "반려";
        String statusColor = status.equals("APPROVED") ? "#10b981" : "#ef4444";
        
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html>");
        html.append("<head>");
        html.append("<meta charset=\"UTF-8\">");
        html.append("<style>");
        html.append("body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }");
        html.append(".container { max-width: 600px; margin: 20px auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }");
        html.append(".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; color: white; }");
        html.append(".header h2 { margin: 0; font-size: 24px; font-weight: 300; }");
        html.append(".status-badge { display: inline-block; padding: 8px 20px; border-radius: 25px; color: white; font-weight: bold; font-size: 14px; background-color: ").append(statusColor).append("; margin-top: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }");
        html.append(".content { padding: 30px 20px; background-color: white; }");
        html.append(".content p { margin: 15px 0; font-size: 16px; }");
        html.append(".user-name { font-weight: bold; color: #667eea; }");
        html.append(".status-text { font-weight: bold; color: ").append(statusColor).append("; }");
        html.append(".comment-section { background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ").append(statusColor).append("; }");
        html.append(".footer { margin-top: 20px; padding: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; background-color: #f8f9fa; text-align: center; }");
        html.append(".footer p { margin: 5px 0; font-size: 14px; }");
        html.append(".small-text { font-size: 12px; color: #9ca3af; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class=\"container\">");
        html.append("<div class=\"header\">");
        html.append("<h2>송금 한도 요청 알림</h2>");
        html.append("<span class=\"status-badge\">").append(statusText).append("</span>");
        html.append("</div>");
        html.append("<div class=\"content\">");
        html.append("<p>안녕하세요, <span class=\"user-name\">").append(userName).append("</span>님</p>");
        html.append("<p>송금 한도 요청이 <span class=\"status-text\">").append(statusText).append("</span>되었습니다.</p>");
        
        if (comment != null && !comment.isEmpty()) {
            html.append("<div class=\"comment-section\"><strong>처리 사유:</strong><br>").append(comment).append("</div>");
        }
        
        html.append("<p>문의사항이 있으시면 고객센터로 연락해주세요.</p>");
        html.append("</div>");
        html.append("<div class=\"footer\">");
        html.append("<p>감사합니다.</p>");
        html.append("<p class=\"small-text\">이 이메일은 자동으로 발송되었습니다.</p>");
        html.append("<p class=\"small-text\">© 2024 송금 서비스. All rights reserved.</p>");
        html.append("</div>");
        html.append("</div>");
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }
}
