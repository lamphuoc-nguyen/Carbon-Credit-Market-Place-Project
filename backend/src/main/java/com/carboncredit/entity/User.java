package com.carboncredit.entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class User {
    @Id
    @GeneratedValue
    @Column(name = "user_id")
    private UUID id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Transient // Don't save to database
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @CreatedDate
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(unique = true, length = 20)
    private String phone;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(name = "province", length = 50)
    private Province province;

    // Relationships
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Vehicle> vehicles;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CarbonCredit> carbonCredits;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Wallet wallet;

    public enum UserRole {
        EV_OWNER, BUYER, CVA, ADMIN
    }

    public enum Province {
        AN_GIANG, BA_RIA_VUNG_TAU, BAC_LIEU, BAC_KAN, BAC_GIANG, BAC_NINH,
        BEN_TRE, BINH_DUONG, BINH_DINH, BINH_PHUOC, BINH_THUAN, CA_MAU,
        CAO_BANG, CAN_THO, DA_NANG, DAK_LAK, DAK_NONG, DIEN_BIEN, DONG_NAI,
        DONG_THAP, GIA_LAI, HA_GIANG, HA_NAM, HA_NOI, HA_TINH, HAI_DUONG,
        HAI_PHONG, HAU_GIANG, HOA_BINH, HO_CHI_MINH, HUNG_YEN, KHANH_HOA,
        KIEN_GIANG, KON_TUM, LAI_CHAU, LAO_CAI, LANG_SON, LAM_DONG, LONG_AN,
        NAM_DINH, NGHE_AN, NINH_BINH, NINH_THUAN, PHU_THO, PHU_YEN, QUANG_BINH,
        QUANG_NAM, QUANG_NGAI, QUANG_NINH, QUANG_TRI, SOC_TRANG, SON_LA,
        TAY_NINH, THAI_BINH, THAI_NGUYEN, THANH_HOA, THUA_THIEN_HUE, TIEN_GIANG,
        TRA_VINH, TUYEN_QUANG, VINH_LONG, VINH_PHUC, YEN_BAI
    }
}
