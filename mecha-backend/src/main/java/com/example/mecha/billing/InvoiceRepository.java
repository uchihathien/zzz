// billing/InvoiceRepository.java
package com.example.mecha.billing;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findByOrderId(Long orderId);
}
