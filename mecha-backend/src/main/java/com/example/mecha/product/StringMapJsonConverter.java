package com.example.mecha.product;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.HashMap;
import java.util.Map;

@Converter
public class StringMapJsonConverter implements AttributeConverter<Map<String, String>, String> {

    private static final ObjectMapper mapper = new ObjectMapper();
    private static final TypeReference<HashMap<String, String>> TYPE_REF =
            new TypeReference<>() {};

    @Override
    public String convertToDatabaseColumn(Map<String, String> attribute) {
        try {
            if (attribute == null) return "{}";
            return mapper.writeValueAsString(attribute);
        } catch (Exception e) {
            throw new RuntimeException("Could not serialize attributes map", e);
        }
    }

    @Override
    public Map<String, String> convertToEntityAttribute(String dbData) {
        try {
            if (dbData == null || dbData.isBlank()) {
                return new HashMap<>();
            }
            return mapper.readValue(dbData, TYPE_REF);
        } catch (Exception e) {
            throw new RuntimeException("Could not deserialize attributes map", e);
        }
    }
}
