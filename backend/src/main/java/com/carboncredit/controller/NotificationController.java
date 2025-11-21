package com.carboncredit.controller;

import com.carboncredit.dto.NotificationDTO;
import com.carboncredit.entity.Notification;
import com.carboncredit.entity.User;
import com.carboncredit.repository.NotificationRepository;
import com.carboncredit.service.UserService;
import com.carboncredit.util.DTOMapper; // Import class Mapper có sẵn của bạn
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    // Helper để lấy User hiện tại từ Token
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getMyNotifications() { // Đổi kiểu trả về thành List<NotificationDTO>
        User user = getCurrentUser();

        // 1. Lấy danh sách Entity từ DB
        List<Notification> entities = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        // 2. Dùng DTOMapper có sẵn để chuyển đổi (Cắt đứt vòng lặp User -> Wallet -> User)
        List<NotificationDTO> dtos = DTOMapper.toNotificationDTOList(entities);

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadCount() {
        User user = getCurrentUser();
        return ResponseEntity.ok(notificationRepository.countByUserIdAndIsReadFalse(user.getId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id) {
        notificationRepository.findById(id).ifPresent(notification -> {
            User currentUser = getCurrentUser();
            if (notification.getUser().getId().equals(currentUser.getId())) {
                notification.markAsRead();
                notificationRepository.save(notification);
            }
        });
        return ResponseEntity.ok().build();
    }
}