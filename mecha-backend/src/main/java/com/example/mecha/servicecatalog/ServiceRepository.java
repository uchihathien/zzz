// servicecatalog/ServiceRepository.java
package com.example.mecha.servicecatalog;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {

    Optional<ServiceEntity> findByCode(String code);

    List<ServiceEntity> findByStatus(ServiceStatus status);
}
