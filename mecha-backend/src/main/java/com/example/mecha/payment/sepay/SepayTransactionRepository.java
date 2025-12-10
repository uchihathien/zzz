// payment/sepay/SepayTransactionRepository.java
package com.example.mecha.payment.sepay;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SepayTransactionRepository extends JpaRepository<SepayTransaction, Long> {

    Optional<SepayTransaction> findBySepayId(Long sepayId);
}
