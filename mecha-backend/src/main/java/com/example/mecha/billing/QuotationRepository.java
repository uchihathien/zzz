// billing/QuotationRepository.java
package com.example.mecha.billing;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuotationRepository extends JpaRepository<Quotation, Long> {

    List<Quotation> findByOrderId(Long orderId);
}
