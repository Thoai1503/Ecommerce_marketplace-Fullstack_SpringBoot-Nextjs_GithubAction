package docker_test.com.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.repository.NotificationRepository;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationRepository notificationRepository = NotificationRepository.Instance();

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getByUserId(@PathVariable long userId) {
        if (userId <= 0) {
            return ResponseEntity.badRequest().body("Missing or invalid userId");
        }

        return ResponseEntity.ok(notificationRepository.GetByUserId(userId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable long id, @RequestParam("user_id") long userId) {
        if (id <= 0 || userId <= 0) {
            return ResponseEntity.badRequest().body("Missing or invalid notification id/user_id");
        }

        boolean updated = notificationRepository.MarkAsRead(id, userId);
        if (!updated) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(Map.of("success", true));
    }

    @PatchMapping("/user/{userId}/read-all")
    public ResponseEntity<?> markAllAsRead(@PathVariable long userId) {
        if (userId <= 0) {
            return ResponseEntity.badRequest().body("Missing or invalid userId");
        }

        int updated = notificationRepository.MarkAllAsRead(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("updated", updated);
        return ResponseEntity.ok(response);
    }
}
