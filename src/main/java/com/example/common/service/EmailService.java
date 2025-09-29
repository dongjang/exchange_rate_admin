package com.example.common.service;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${GMAIL_USERNAME}")
    private String fromEmail;
    
    /**
     * 송금 한도 요청 승인/반려 알림 이메일 발송
     */
    public void sendRemittanceLimitNotification(String toEmail, String userName, String status, String comment, 
                                               BigDecimal dailyLimit, BigDecimal monthlyLimit, BigDecimal singleLimit) {
        try {
            // 이메일 설정 검증
            if (fromEmail == null || fromEmail.isEmpty()) {
                throw new RuntimeException("발신자 이메일이 설정되지 않았습니다. GMAIL_USERNAME 환경변수를 확인해주세요.");
            }
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("송금 한도 변경 요청 " + (status.equals("APPROVED") ? "승인" : "반려") + " 알림");
            helper.setText(createHtmlEmailContent(userName, status, comment, dailyLimit, monthlyLimit, singleLimit), true); // HTML 모드
            
            mailSender.send(message);
            System.out.println("이메일 발송 성공: " + toEmail + " - " + status);
        } catch (MessagingException e) {
            System.err.println("이메일 발송 실패: " + e.getMessage());
            System.err.println("상세 에러: " + e.getCause());
            
            // 인증 실패인 경우 더 구체적인 안내
            if (e.getMessage().contains("Authentication failed")) {
                throw new RuntimeException("이메일 인증 실패: Gmail 앱 비밀번호가 올바른지 확인해주세요. " +
                    "Gmail 계정에서 2단계 인증을 활성화하고 앱 비밀번호를 생성해야 합니다.", e);
            }
            
            throw new RuntimeException("이메일 발송 실패: " + e.getMessage(), e);
        } catch (Exception e) {
            System.err.println("예상치 못한 이메일 발송 오류: " + e.getMessage());
            throw new RuntimeException("이메일 발송 중 오류 발생: " + e.getMessage(), e);
        }
    }
    
    /**
     * QNA 답변 알림 이메일 발송
     */
    public void sendQnaAnswerEmail(String toEmail, String userName, String qnaTitle, String qnaContent, String answerContent) {
        try {
            // 이메일 설정 검증
            if (fromEmail == null || fromEmail.isEmpty()) {
                throw new RuntimeException("발신자 이메일이 설정되지 않았습니다. GMAIL_USERNAME 환경변수를 확인해주세요.");
            }
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Q&A 답변이 등록되었습니다 - " + qnaTitle);
            helper.setText(createQnaAnswerHtmlContent(userName, qnaTitle, qnaContent, answerContent), true); // HTML 모드
            
            mailSender.send(message);
            System.out.println("QNA 답변 이메일 발송 성공: " + toEmail);
        } catch (MessagingException e) {
            System.err.println("QNA 답변 이메일 발송 실패: " + e.getMessage());
            System.err.println("상세 에러: " + e.getCause());
            
            // 인증 실패인 경우 더 구체적인 안내
            if (e.getMessage().contains("Authentication failed")) {
                throw new RuntimeException("이메일 인증 실패: Gmail 앱 비밀번호가 올바른지 확인해주세요. " +
                    "Gmail 계정에서 2단계 인증을 활성화하고 앱 비밀번호를 생성해야 합니다.", e);
            }
            
            throw new RuntimeException("QNA 답변 이메일 발송 실패: " + e.getMessage(), e);
        } catch (Exception e) {
            System.err.println("예상치 못한 QNA 답변 이메일 발송 오류: " + e.getMessage());
            throw new RuntimeException("QNA 답변 이메일 발송 중 오류 발생: " + e.getMessage(), e);
        }
    }
    
    /**
     * HTML 이메일 내용 생성
     */
    private String createHtmlEmailContent(String userName, String status, String comment, 
                                        BigDecimal dailyLimit, BigDecimal monthlyLimit, BigDecimal singleLimit) {
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
        html.append(".header h2 { margin: 0; font-size: 27px;}");
        html.append(".status-badge { display: inline-block; padding: 8px 20px; border-radius: 25px; color: white; font-weight: bold; font-size: 14px; background-color: ").append(statusColor).append("; margin-top: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }");
        html.append(".content { padding: 30px 20px; background-color: white; }");
        html.append(".content p { margin: 15px 0; font-size: 16px; }");
        html.append(".user-name { font-weight: bold; color: #667eea; }");
        html.append(".status-text { font-weight: bold; color: ").append(statusColor).append("; }");
        html.append(".comment-section { background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ").append(statusColor).append("; }");
        html.append(".comment-section strong { font-size: 20px; color: #374151; }");
        html.append(".comment-section .comment-text { font-size: 20px; line-height: 1.6; color: #4b5563; margin-top: 8px; }");
        html.append(".limit-section { padding: 20px; border-radius: 8px; margin: 20px 0; }");
        html.append(".limit-section.approved { background-color: #f0f9ff; border: 1px solid #0ea5e9; }");
        html.append(".limit-section.rejected { background-color: #fef2f2; border: 1px solid #f87171; }");
        html.append(".limit-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; text-align: center; }");
        html.append(".limit-section.approved .limit-title { color: #0c4a6e; }");
        html.append(".limit-section.rejected .limit-title { color: #7f1d1d; }");
        html.append(".limit-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; }");
        html.append(".limit-item { background: white; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #e0e7ef; }");
        html.append(".limit-label { font-size: 14px; color: #64748b; margin-bottom: 8px; }");
        html.append(".limit-value { font-size: 20px; font-weight: bold; color: #0c4a6e; }");
        html.append(".footer { margin-top: 20px; padding: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; background-color: #f8f9fa; text-align: center; }");
        html.append(".footer p { margin: 5px 0; font-size: 14px; }");
        html.append(".small-text { font-size: 12px; color: #9ca3af; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class=\"container\">");
        html.append("<div class=\"header\">");
        html.append("<h2>송금 한도 변경 요청 알림</h2>");
        html.append("<span class=\"status-badge\">").append(statusText).append("</span>");
        html.append("</div>");
        html.append("<div class=\"content\">");
        html.append("<p>안녕하세요, <span class=\"user-name\">").append(userName).append("</span>님</p>");
        html.append("<p>송금 한도 변경 요청이 <span class=\"status-text\">").append(statusText).append("</span>되었습니다.</p>");

        // 한도 정보 표시 (승인/반려 모두)
            String limitTitle = status.equals("APPROVED") ? "📊 승인된 송금 한도" : "📊 요청하신 송금 한도";
            String limitSectionClass = status.equals("APPROVED") ? "limit-section approved" : "limit-section rejected";
            
            html.append("<div class=\"").append(limitSectionClass).append("\">");
            html.append("<div class=\"limit-title\">").append(limitTitle).append("</div>");
            html.append("<div class=\"limit-grid\">");
            html.append("<div class=\"limit-item\">");
            html.append("<div class=\"limit-label\">일일 한도</div>");
            html.append("<div class=\"limit-value\">").append(String.format("%,d", dailyLimit.longValue())).append("원</div>");
            html.append("</div>");
            html.append("<div class=\"limit-item\">");
            html.append("<div class=\"limit-label\">월 한도</div>");
            html.append("<div class=\"limit-value\">").append(String.format("%,d", monthlyLimit.longValue())).append("원</div>");
            html.append("</div>");
            html.append("<div class=\"limit-item\">");
            html.append("<div class=\"limit-label\">1회 한도</div>");
            html.append("<div class=\"limit-value\">").append(String.format("%,d", singleLimit.longValue())).append("원</div>");
            html.append("</div>");
            html.append("</div>");
            html.append("</div>");
                
        if (status.equals("REJECTED") && !comment.isEmpty()) {
            // 줄바꿈을 HTML <br> 태그로 변환 (여러 종류의 줄바꿈 문자 처리)
            String formattedComment = comment
                .replace("\r\n", "<br>")  // Windows 줄바꿈
                .replace("\r", "<br>")    // Mac OS 9 이하 줄바꿈
                .replace("\n", "<br>");   // Unix/Linux 줄바꿈
            html.append("<div class=\"comment-section\"><strong>처리 사유:</strong><div class=\"comment-text\">").append(formattedComment).append("</div></div>");
        }
        
        html.append("<p>기타 문의사항은 Q&A로 문의해 주세요.</p>");
        html.append("<p>감사합니다.</p>");
        html.append("</div>");
        html.append("<div class=\"footer\">");
        html.append("<p class=\"small-text\">이 이메일은 자동으로 발송되었습니다.</p>");
        html.append("<p class=\"small-text\">© 2025 송금 서비스. All rights reserved.</p>");
        html.append("</div>");
        html.append("</div>");
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }
    
    /**
     * QNA 답변 이메일 HTML 내용 생성
     */
    private String createQnaAnswerHtmlContent(String userName, String qnaTitle, String qnaContent, String answerContent) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html lang=\"ko\">");
        html.append("<head>");
        html.append("<meta charset=\"UTF-8\">");
        html.append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
        html.append("<title>Q&A 답변 알림</title>");
        html.append("<style>");
        html.append("body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }");
        html.append(".container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }");
        html.append(".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }");
        html.append(".header h1 { margin: 0; font-size: 24px; font-weight: 600; }");
        html.append(".header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }");
        html.append(".content { padding: 30px; }");
        html.append(".greeting { font-size: 18px; margin-bottom: 20px; color: #1f2937; }");
        html.append(".status-badge { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 20px; }");
        html.append(".qna-section { background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #3b82f6; }");
        html.append(".qna-title { font-size: 20px; font-weight: 600; color: #1f2937; margin-bottom: 15px; }");
        html.append(".qna-content { color: #4b5563; line-height: 1.7; margin-bottom: 15px; font-size: 16px; }");
        html.append(".answer-section { background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #0ea5e9; }");
        html.append(".answer-title { font-size: 18px; font-weight: 600; color: #0c4a6e; margin-bottom: 15px; }");
        html.append(".answer-content { color: #075985; line-height: 1.7; font-size: 16px; }");
        html.append(".footer { background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }");
        html.append(".small-text { font-size: 12px; color: #6b7280; margin: 5px 0; }");
        html.append(".highlight { background-color: #fef3c7; padding: 2px 4px; border-radius: 4px; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class=\"container\">");
        html.append("<div class=\"header\">");
        html.append("<h1>📧 Q&A 답변 알림</h1>");
        html.append("<p>문의하신 Q&A에 답변이 등록되었습니다</p>");
        html.append("</div>");
        html.append("<div class=\"content\">");
        html.append("<div class=\"greeting\">안녕하세요, <span class=\"highlight\">").append(userName).append("</span>님!</div>");
        html.append("<div class=\"status-badge\">✅ 답변 완료</div>");
        html.append("<p>문의해주신 Q&A에 대한 답변이 등록되었습니다. 아래 내용을 확인해주세요.</p>");
        
        // QNA 질문 내용
        html.append("<div class=\"qna-section\">");
        html.append("<div class=\"qna-title\">📝 문의 내용</div>");
        html.append("<div class=\"qna-content\">");
        html.append("<strong>제목:</strong> ").append(qnaTitle).append("<br><br>");
        // 줄바꿈을 HTML <br> 태그로 변환
        String formattedQnaContent = qnaContent
            .replace("\r\n", "<br>")
            .replace("\r", "<br>")
            .replace("\n", "<br>");
        html.append("<strong>내용:</strong><br>").append(formattedQnaContent);
        html.append("</div>");
        html.append("</div>");
        
        // 답변 내용
        html.append("<div class=\"answer-section\">");
        html.append("<div class=\"answer-title\">💬 관리자 답변</div>");
        html.append("<div class=\"answer-content\">");
        // 줄바꿈을 HTML <br> 태그로 변환
        String formattedAnswerContent = answerContent
            .replace("\r\n", "<br>")
            .replace("\r", "<br>")
            .replace("\n", "<br>");
        html.append(formattedAnswerContent);
        html.append("</div>");
        html.append("</div>");
        
        html.append("<p>추가 문의사항이 있으시면 언제든지 Q&A를 통해 문의해 주세요.</p>");
        html.append("<p>감사합니다.</p>");
        html.append("</div>");
        html.append("<div class=\"footer\">");
        html.append("<p class=\"small-text\">이 이메일은 자동으로 발송되었습니다.</p>");
        html.append("<p class=\"small-text\">© 2025 송금 서비스. All rights reserved.</p>");
        html.append("</div>");
        html.append("</div>");
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }
}
