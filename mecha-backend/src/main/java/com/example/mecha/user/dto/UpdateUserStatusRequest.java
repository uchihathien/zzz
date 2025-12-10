package com.example.mecha.user.dto;

import com.example.mecha.user.AccountStatus;
import lombok.Data;

@Data
public class UpdateUserStatusRequest {
    private AccountStatus status;
}
