// servicecatalog/ServiceManagementService.java
package com.example.mecha.servicecatalog;

import com.example.mecha.servicecatalog.dto.ServiceCreateRequest;
import com.example.mecha.servicecatalog.dto.ServiceDto;
import com.example.mecha.servicecatalog.dto.ServiceUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceManagementService {

    private final ServiceRepository serviceRepository;

    @Transactional
    public ServiceDto create(ServiceCreateRequest request) {
        if (request.getCode() != null && serviceRepository.findByCode(request.getCode()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "SERVICE_CODE_ALREADY_EXISTS");
        }

        ServiceEntity entity = ServiceEntity.builder()
                .name(request.getName())
                .code(request.getCode())
                .description(request.getDescription())
                .type(request.getType() != null ? request.getType() : ServiceType.OTHER)
                .basePrice(request.getBasePrice())
                .durationMinutes(request.getDurationMinutes())
                .status(request.getStatus() != null ? request.getStatus() : ServiceStatus.ACTIVE)
                .build();

        entity = serviceRepository.save(entity);
        return toDto(entity);
    }

    @Transactional
    public ServiceDto update(Long id, ServiceUpdateRequest request) {
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SERVICE_NOT_FOUND"));

        if (request.getName() != null) service.setName(request.getName());
        if (request.getCode() != null) {
            serviceRepository.findByCode(request.getCode())
                    .filter(other -> !other.getId().equals(id))
                    .ifPresent(other -> {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "SERVICE_CODE_ALREADY_EXISTS");
                    });
            service.setCode(request.getCode());
        }

        if (request.getDescription() != null) service.setDescription(request.getDescription());
        if (request.getType() != null) service.setType(request.getType());
        if (request.getBasePrice() != null) service.setBasePrice(request.getBasePrice());
        if (request.getDurationMinutes() != null) service.setDurationMinutes(request.getDurationMinutes());
        if (request.getStatus() != null) service.setStatus(request.getStatus());

        return toDto(service);
    }

    @Transactional(readOnly = true)
    public ServiceDto getById(Long id) {
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SERVICE_NOT_FOUND"));
        return toDto(service);
    }

    @Transactional(readOnly = true)
    public List<ServiceDto> list(ServiceStatus status) {
        List<ServiceEntity> services =
                (status != null) ? serviceRepository.findByStatus(status) : serviceRepository.findAll();

        return services.stream().map(this::toDto).toList();
    }

    @Transactional
    public void delete(Long id) {
        if (!serviceRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "SERVICE_NOT_FOUND");
        }
        serviceRepository.deleteById(id);
    }

    @Transactional
    public ServiceDto changeStatus(Long id, ServiceStatus status) {
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SERVICE_NOT_FOUND"));
        service.setStatus(status);
        return toDto(service);
    }

    private ServiceDto toDto(ServiceEntity s) {
        return ServiceDto.builder()
                .id(s.getId())
                .name(s.getName())
                .code(s.getCode())
                .description(s.getDescription())
                .type(s.getType())
                .basePrice(s.getBasePrice())
                .durationMinutes(s.getDurationMinutes())
                .status(s.getStatus())
                .build();
    }
}
