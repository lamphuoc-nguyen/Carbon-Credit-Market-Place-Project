package com.carboncredit.service;

import com.carboncredit.entity.CarbonCredit;
import com.carboncredit.entity.CreditListing;
import com.carboncredit.entity.Transaction;
import com.carboncredit.entity.User;
import com.carboncredit.repository.CarbonCreditRepository;
import com.carboncredit.repository.CreditListingRepository;
import com.carboncredit.repository.DisputeRepository;
import com.carboncredit.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock private ValidationService validationService;
    @Mock private TransactionRepository transactionRepository;
    @Mock private DisputeRepository disputeRepository;
    @Mock private CreditListingRepository creditListingRepository;
    @Mock private CarbonCreditRepository carbonCreditRepository;
    @Mock private PaymentService paymentService;
    @Mock private NotificationService notificationService;
    @Mock private AuditService auditService;
    @Mock private WalletService walletService;

    @InjectMocks
    private TransactionService transactionService;

    @Test
    void initiatePurchaseReservesPartialQuantityAndKeepsListingActive() {
        UUID listingId = UUID.randomUUID();
        User seller = user(User.UserRole.EV_OWNER);
        User buyer = user(User.UserRole.BUYER);
        CarbonCredit credit = credit(seller, new BigDecimal("10.00"));
        CreditListing listing = listing(listingId, credit, new BigDecimal("100.00"));

        when(creditListingRepository.findByIdForUpdate(listingId)).thenReturn(Optional.of(listing));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Transaction transaction = transactionService.initiatePurchase(
                listingId,
                buyer,
                "BANK_TRANSFER",
                new BigDecimal("2.50"));

        assertEquals(new BigDecimal("25.00"), transaction.getAmount());
        assertEquals(new BigDecimal("2.50"), transaction.getCreditAmount());
        assertEquals(Transaction.PaymentMethod.BANK_TRANSFER, transaction.getPaymentMethod());
        assertEquals(Transaction.TransactionStatus.PENDING, transaction.getStatus());
        assertNotNull(transaction.getCreatedAt());

        assertEquals(new BigDecimal("7.50"), credit.getCreditAmount());
        assertEquals(new BigDecimal("75.00"), listing.getPrice());
        assertEquals(CreditListing.ListingStatus.ACTIVE, listing.getStatus());
        verify(carbonCreditRepository).save(credit);
        verify(creditListingRepository).save(listing);
    }

    @Test
    void initiatePurchaseReservesFullQuantityAndLocksListing() {
        UUID listingId = UUID.randomUUID();
        User seller = user(User.UserRole.EV_OWNER);
        User buyer = user(User.UserRole.BUYER);
        CarbonCredit credit = credit(seller, new BigDecimal("4.00"));
        CreditListing listing = listing(listingId, credit, new BigDecimal("40.00"));

        when(creditListingRepository.findByIdForUpdate(listingId)).thenReturn(Optional.of(listing));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Transaction transaction = transactionService.initiatePurchase(listingId, buyer, "VNPAY_QR");

        assertEquals(new BigDecimal("40.00"), transaction.getAmount());
        assertEquals(new BigDecimal("4.00"), transaction.getCreditAmount());
        assertEquals(Transaction.PaymentMethod.VNPAY, transaction.getPaymentMethod());
        assertEquals(BigDecimal.ZERO, credit.getCreditAmount());
        assertEquals(CreditListing.ListingStatus.PENDING_TRANSACTION, listing.getStatus());
    }

    private User user(User.UserRole role) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername(role.name().toLowerCase());
        user.setRole(role);
        return user;
    }

    private CarbonCredit credit(User seller, BigDecimal amount) {
        CarbonCredit credit = new CarbonCredit();
        credit.setId(UUID.randomUUID());
        credit.setUser(seller);
        credit.setCreditAmount(amount);
        credit.setCo2ReducedKg(amount.multiply(new BigDecimal("1000.00")));
        credit.setStatus(CarbonCredit.CreditStatus.LISTED);
        return credit;
    }

    private CreditListing listing(UUID listingId, CarbonCredit credit, BigDecimal price) {
        CreditListing listing = new CreditListing();
        listing.setId(listingId);
        listing.setCredit(credit);
        listing.setListingType(CreditListing.ListingType.FIXED);
        listing.setPrice(price);
        listing.setStatus(CreditListing.ListingStatus.ACTIVE);
        return listing;
    }
}
