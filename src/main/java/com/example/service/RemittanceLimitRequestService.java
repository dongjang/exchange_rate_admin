package com.example.service;

import com.example.domain.RemittanceLimitRequest;
import com.example.dto.RemittanceLimitRequestResponse;
import com.example.dto.RemittanceLimitRequestWithFilesResponse;
import com.example.mapper.RemittanceLimitRequestMapper;
import com.example.repository.RemittanceLimitRequestRepository;
import com.example.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class RemittanceLimitRequestService {
    
    private final RemittanceLimitRequestMapper remittanceLimitRequestMapper;
    private final RemittanceLimitRequestRepository remittanceLimitRequestRepository;
    private final FileService fileService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    
    public RemittanceLimitRequestService(RemittanceLimitRequestMapper remittanceLimitRequestMapper,
                                       RemittanceLimitRequestRepository remittanceLimitRequestRepository,
                                       FileService fileService,
                                       EmailService emailService,
                                       UserRepository userRepository) {
        this.remittanceLimitRequestMapper = remittanceLimitRequestMapper;
        this.remittanceLimitRequestRepository = remittanceLimitRequestRepository;
        this.fileService = fileService;
        this.emailService = emailService;
        this.userRepository = userRepository;
    }
    
    // 사용자 페이지용 (JPA)
    public List<RemittanceLimitRequestWithFilesResponse> getUserRequests(Long userId) {
        List<RemittanceLimitRequest> requests = remittanceLimitRequestRepository.findByUserId(userId);
        List<RemittanceLimitRequestWithFilesResponse> responses = new ArrayList<>();
        
        for (RemittanceLimitRequest request : requests) {
            RemittanceLimitRequestWithFilesResponse response = new RemittanceLimitRequestWithFilesResponse();
            response.setId(request.getId());
            response.setUserId(request.getUserId());
            response.setUserName(request.getUserName());
            response.setDailyLimit(request.getDailyLimit());
            response.setMonthlyLimit(request.getMonthlyLimit());
            response.setSingleLimit(request.getSingleLimit());
            response.setReason(request.getReason());
            response.setStatus(request.getStatus());
            response.setAdminId(request.getAdminId());
            response.setAdminComment(request.getAdminComment());
            response.setProcessedAt(request.getProcessedAt());
            response.setCreatedAt(request.getCreatedAt());
            response.setUpdatedAt(request.getUpdatedAt());
            
            // 파일 정보 조회 및 설정
            if (request.getIncomeFileId() != null) {
                var incomeFile = fileService.getFileById(request.getIncomeFileId());
                if (incomeFile != null) {
                    response.setIncomeFile(new RemittanceLimitRequestWithFilesResponse.FileInfo(
                        incomeFile.getId(),
                        incomeFile.getOriginalName(),
                        incomeFile.getFileSize(),
                        incomeFile.getFileType()
                    ));
                }
            }
            
            if (request.getBankbookFileId() != null) {
                var bankbookFile = fileService.getFileById(request.getBankbookFileId());
                if (bankbookFile != null) {
                    response.setBankbookFile(new RemittanceLimitRequestWithFilesResponse.FileInfo(
                        bankbookFile.getId(),
                        bankbookFile.getOriginalName(),
                        bankbookFile.getFileSize(),
                        bankbookFile.getFileType()
                    ));
                }
            }
            
            if (request.getBusinessFileId() != null) {
                var businessFile = fileService.getFileById(request.getBusinessFileId());
                if (businessFile != null) {
                    response.setBusinessFile(new RemittanceLimitRequestWithFilesResponse.FileInfo(
                        businessFile.getId(),
                        businessFile.getOriginalName(),
                        businessFile.getFileSize(),
                        businessFile.getFileType()
                    ));
                }
            }
            
            responses.add(response);
        }
        
        return responses;
    }
    
    public RemittanceLimitRequest getUserRequestById(Long requestId, Long userId) {
        return remittanceLimitRequestRepository.findById(requestId)
                .filter(request -> request.getUserId().equals(userId))
                .orElse(null);
    }
    
    // 관리자 페이지용 (MyBatis)
    public List<RemittanceLimitRequestResponse> getAdminRequests(Map<String, Object> searchRequest) {
        return remittanceLimitRequestMapper.selectRemittanceLimitRequests(searchRequest);
    }
    
    public int countAdminRequests(Map<String, Object> searchRequest) {
        return remittanceLimitRequestMapper.countRemittanceLimitRequests(searchRequest);
    }
    
    public RemittanceLimitRequestResponse getAdminRequestById(Long requestId) {
        return remittanceLimitRequestMapper.selectRemittanceLimitRequestById(requestId);
    }
    
    // 한도 변경 신청 생성 (MyBatis 사용)
    @Transactional
    public RemittanceLimitRequest createRequest(Long userId, 
                                             BigDecimal dailyLimit, 
                                             BigDecimal monthlyLimit, 
                                             BigDecimal singleLimit, 
                                             String reason,
                                             MultipartFile incomeFile,
                                             MultipartFile bankbookFile,
                                             MultipartFile businessFile) throws IOException {
        
        RemittanceLimitRequest request = new RemittanceLimitRequest();
        request.setUserId(userId);
        request.setDailyLimit(dailyLimit);
        request.setMonthlyLimit(monthlyLimit);
        request.setSingleLimit(singleLimit);
        request.setReason(reason);
        request.setStatus(RemittanceLimitRequest.RequestStatus.PENDING);
        request.setCreatedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());
        
        // 파일 업로드 및 파일 ID 설정
        if (incomeFile != null && !incomeFile.isEmpty()) {
            var uploadedFile = fileService.uploadFile(incomeFile, userId);
            request.setIncomeFileId(uploadedFile.getId());
        }
        
        if (bankbookFile != null && !bankbookFile.isEmpty()) {
            var uploadedFile = fileService.uploadFile(bankbookFile, userId);
            request.setBankbookFileId(uploadedFile.getId());
        }
        
        if (businessFile != null && !businessFile.isEmpty()) {
            var uploadedFile = fileService.uploadFile(businessFile, userId);
            request.setBusinessFileId(uploadedFile.getId());
        }
        
        remittanceLimitRequestMapper.insertRemittanceLimitRequest(request);
        return request;
    }
    
    // 한도 변경 신청 수정 (MyBatis 사용)
    @Transactional
    public RemittanceLimitRequest updateRequest(Long requestId,
                                             Long userId,
                                             BigDecimal dailyLimit, 
                                             BigDecimal monthlyLimit, 
                                             BigDecimal singleLimit, 
                                             String reason,
                                             MultipartFile incomeFile,
                                             MultipartFile bankbookFile,
                                             MultipartFile businessFile,
                                             boolean isRerequest) throws IOException {
        
        // 기존 요청 조회 (DTO로 받음)
        RemittanceLimitRequestResponse existingRequestDto = remittanceLimitRequestMapper.selectRemittanceLimitRequestById(requestId);
        if (existingRequestDto == null || !existingRequestDto.getUserId().equals(userId)) {
            throw new IllegalArgumentException("요청을 찾을 수 없거나 권한이 없습니다.");
        }
        
        // PENDING 상태가 아니면 수정 불가 (재신청 모드가 아닐 때만)
        /* 
        if (!isRerequest && (existingRequestDto.getStatus() != RemittanceLimitRequest.RequestStatus.PENDING || existingRequestDto.getStatus() != RemittanceLimitRequest.RequestStatus.REJECTED)) {
            throw new IllegalArgumentException("대기 또는 반려 상태의 요청만 수정할 수 있습니다.");
        }
        */
        
        // DTO를 엔티티로 변환
        RemittanceLimitRequest existingRequest = new RemittanceLimitRequest();
        existingRequest.setId(existingRequestDto.getId());
        existingRequest.setUserId(existingRequestDto.getUserId());
        existingRequest.setDailyLimit(existingRequestDto.getDailyLimit());
        existingRequest.setMonthlyLimit(existingRequestDto.getMonthlyLimit());
        existingRequest.setSingleLimit(existingRequestDto.getSingleLimit());
        existingRequest.setReason(existingRequestDto.getReason());
        existingRequest.setStatus(RemittanceLimitRequest.RequestStatus.valueOf(existingRequestDto.getStatus()));
        existingRequest.setIncomeFileId(existingRequestDto.getIncomeFileId());
        existingRequest.setBankbookFileId(existingRequestDto.getBankbookFileId());
        existingRequest.setBusinessFileId(existingRequestDto.getBusinessFileId());
        existingRequest.setAdminId(existingRequestDto.getAdminId());
        existingRequest.setAdminComment(existingRequestDto.getAdminComment());
        existingRequest.setProcessedAt(existingRequestDto.getProcessedAt());
        existingRequest.setCreatedAt(existingRequestDto.getCreatedAt());
        existingRequest.setUpdatedAt(existingRequestDto.getUpdatedAt());
        
        // 새로운 데이터로 업데이트
        existingRequest.setDailyLimit(dailyLimit);
        existingRequest.setMonthlyLimit(monthlyLimit);
        existingRequest.setSingleLimit(singleLimit);
        existingRequest.setReason(reason);
        existingRequest.setUpdatedAt(LocalDateTime.now());
        
        // 재신청 모드일 때는 created_at을 현재 시간으로 업데이트하고 status를 PENDING으로 변경
        if (isRerequest) {
            existingRequest.setCreatedAt(LocalDateTime.now());
            existingRequest.setStatus(RemittanceLimitRequest.RequestStatus.PENDING);
            existingRequest.setAdminId(null);
            existingRequest.setAdminComment(null);
            existingRequest.setProcessedAt(null);
        } else if (RemittanceLimitRequest.RequestStatus.valueOf(existingRequestDto.getStatus()) == RemittanceLimitRequest.RequestStatus.REJECTED) {
            // 반려 상태일 때도 수정 시 PENDING으로 변경
            existingRequest.setStatus(RemittanceLimitRequest.RequestStatus.PENDING);
            existingRequest.setAdminId(null);
            existingRequest.setAdminComment(null);
            existingRequest.setProcessedAt(null);
        }
        
        // 새 파일 업로드 및 파일 ID 설정 (새 파일이 있는 경우에만 기존 파일 삭제)
        if (incomeFile != null && !incomeFile.isEmpty()) {
            // 새 파일이 업로드된 경우에만 기존 파일 삭제
            if (existingRequest.getIncomeFileId() != null) {
                fileService.deleteFile(existingRequest.getIncomeFileId());
            }
            var uploadedFile = fileService.uploadFile(incomeFile, userId);
            existingRequest.setIncomeFileId(uploadedFile.getId());
        }
        
        if (bankbookFile != null && !bankbookFile.isEmpty()) {
            // 새 파일이 업로드된 경우에만 기존 파일 삭제
            if (existingRequest.getBankbookFileId() != null) {
                fileService.deleteFile(existingRequest.getBankbookFileId());
            }
            var uploadedFile = fileService.uploadFile(bankbookFile, userId);
            existingRequest.setBankbookFileId(uploadedFile.getId());
        }
        
        if (businessFile != null && !businessFile.isEmpty()) {
            // 새 파일이 업로드된 경우에만 기존 파일 삭제
            if (existingRequest.getBusinessFileId() != null) {
                fileService.deleteFile(existingRequest.getBusinessFileId());
            }
            var uploadedFile = fileService.uploadFile(businessFile, userId);
            existingRequest.setBusinessFileId(uploadedFile.getId());
        }
        
        remittanceLimitRequestMapper.updateRemittanceLimitRequest(existingRequest);
        return existingRequest;
    }
    
    // 관리자 승인/반려 처리
    @Transactional
    public void processRequest(Long requestId, 
                             RemittanceLimitRequest.RequestStatus status, 
                             Long adminId, 
                             String adminComment,
                             Long userId,
                             BigDecimal dailyLimit,
                             BigDecimal monthlyLimit,   
                             BigDecimal singleLimit) {
        remittanceLimitRequestMapper.updateRemittanceLimitRequestStatus(requestId, status.name(), adminId, adminComment);
        //승인일 때만 추가
        if(RemittanceLimitRequest.RequestStatus.APPROVED.equals(status)){
        //사용자 별로 한 개만 존재하도록 삭제 후 추가
        remittanceLimitRequestMapper.deleteUserRemittanceLimit(userId);
        remittanceLimitRequestMapper.insertUserRemittanceLimit(userId, dailyLimit, monthlyLimit, singleLimit, requestId);
        }
        
        // 이메일 발송
        try {
            // userId가 null인 경우 요청 ID로부터 조회
            Long targetUserId = userId;
            if (targetUserId == null) {
                RemittanceLimitRequestResponse request = remittanceLimitRequestMapper.selectRemittanceLimitRequestById(requestId);
                if (request != null) {
                    targetUserId = request.getUserId();
                }
            }
            
            // 사용자 정보 조회
            if (targetUserId != null) {
                var user = userRepository.findById(targetUserId);
                if (user.isPresent()) {
                    String userEmail = user.get().getEmail();
                    String userName = user.get().getName();
                
                    // 이메일 발송 - 한도 정보 포함
                    emailService.sendRemittanceLimitNotification(userEmail, userName, status.name(), adminComment,dailyLimit, monthlyLimit, singleLimit);

                }
            }
        } catch (Exception e) {
            System.err.println("이메일 발송 중 오류 발생: " + e.getMessage());
            // 이메일 발송 실패해도 트랜잭션은 롤백하지 않음
        }
    }
    
    // 신청 취소 처리
    @Transactional
    public void cancelRequest(Long requestId, Long userId) {
        RemittanceLimitRequest request = remittanceLimitRequestRepository.findById(requestId)
                .filter(req -> req.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("요청을 찾을 수 없거나 권한이 없습니다."));
        
        // PENDING 상태가 아니면 취소 불가
        if (request.getStatus() != RemittanceLimitRequest.RequestStatus.PENDING) {
            throw new IllegalArgumentException("대기중인 요청만 취소할 수 있습니다.");
        }
        
        // user_remittance_limit에 해당 사용자의 데이터가 있는지 확인
        int userLimitCount = remittanceLimitRequestMapper.hasUserRemittanceLimit(userId);
        boolean hasUserLimit = userLimitCount > 0;
        
        if (hasUserLimit) {
            remittanceLimitRequestMapper.updateRemittanceLimitRequestStatus(requestId, "APPROVED",  null,null);
            
        } else {
            // user_remittance_limit에 데이터가 없으면 기존 로직대로 삭제
            // 파일 ID들을 임시로 저장
            Long incomeFileId = request.getIncomeFileId();
            Long bankbookFileId = request.getBankbookFileId();
            Long businessFileId = request.getBusinessFileId();
            
            // 먼저 요청에서 파일 ID들을 null로 설정 (외래키 제약조건 해결) - MyBatis 사용
            remittanceLimitRequestMapper.clearFileIds(requestId);
            
            // 첨부된 파일들 삭제
            if (incomeFileId != null) {
                fileService.deleteFile(incomeFileId);
            }
            if (bankbookFileId != null) {
                fileService.deleteFile(bankbookFileId);
            }
            if (businessFileId != null) {
                fileService.deleteFile(businessFileId);
            }
            
            // 요청 삭제
            remittanceLimitRequestRepository.delete(request);
            
        }
    }
} 