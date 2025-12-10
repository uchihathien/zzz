package com.example.mecha.product;

import com.example.mecha.product.dto.CategoryCreateRequest;
import com.example.mecha.product.dto.CategoryDto;
import com.example.mecha.product.dto.CategoryUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductCategoryService {

    private final ProductCategoryRepository categoryRepository;

    @Transactional
    public CategoryDto createCategory(CategoryCreateRequest request) {
        ProductCategory parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
        }

        ProductCategory cat = ProductCategory.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .parent(parent)
                .build();

        cat = categoryRepository.save(cat);
        return toDto(cat, false);
    }

    @Transactional
    public CategoryDto updateCategory(Long id, CategoryUpdateRequest request) {
        ProductCategory cat = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (request.getName() != null) {
            cat.setName(request.getName());
        }
        if (request.getSortOrder() != null) {
            cat.setSortOrder(request.getSortOrder());
        }

        if (request.getParentId() != null) {
            if (Objects.equals(id, request.getParentId())) {
                throw new RuntimeException("Category cannot be parent of itself");
            }
            ProductCategory parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
            cat.setParent(parent);
        } else {
            cat.setParent(null);
        }

        return toDto(cat, false);
    }

    @Transactional
    public void deleteCategory(Long id) {
        // TODO: có thể check nếu còn products thì không cho xóa
        categoryRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getCategoryTree() {
        try {
            // Fetch all categories - parent will be eagerly loaded in transaction
            List<ProductCategory> all = categoryRepository.findAll();
            
            if (all.isEmpty()) {
                return List.of();
            }

            // Group by parent ID
            Map<Long, List<ProductCategory>> childrenByParent = new HashMap<>();
            for (ProductCategory c : all) {
                Long parentKey = c.getParent() != null ? c.getParent().getId() : 0L;
                childrenByParent.computeIfAbsent(parentKey, k -> new ArrayList<>()).add(c);
            }

            return buildTree(null, childrenByParent);
        } catch (Exception e) {
            // Log the actual error
            throw new RuntimeException("Failed to build category tree: " + e.getMessage(), e);
        }
    }

    private List<CategoryDto> buildTree(Long parentId, Map<Long, List<ProductCategory>> childrenByParent) {
        Long key = parentId == null ? 0L : parentId;

        // Fix: tạo list mới để tránh lỗi sort trên List.of()
        List<ProductCategory> children = new ArrayList<>(childrenByParent.getOrDefault(key, List.of()));

        children.sort(Comparator.comparing(
                c -> c.getSortOrder() == null ? 0 : c.getSortOrder()
        ));

        List<CategoryDto> result = new ArrayList<>();
        for (ProductCategory c : children) {
            CategoryDto dto = CategoryDto.builder()
                    .id(c.getId())
                    .name(c.getName())
                    .slug(c.getSlug())
                    .parentId(c.getParent() != null ? c.getParent().getId() : null)
                    .sortOrder(c.getSortOrder())
                    .children(buildTree(c.getId(), childrenByParent))
                    .build();
            result.add(dto);
        }
        return result;
    }

    private CategoryDto toDto(ProductCategory cat, boolean includeChildren) {
        CategoryDto.CategoryDtoBuilder builder = CategoryDto.builder()
                .id(cat.getId())
                .name(cat.getName())
                .slug(cat.getSlug())
                .parentId(cat.getParent() != null ? cat.getParent().getId() : null)
                .sortOrder(cat.getSortOrder());

        if (includeChildren) {
            List<CategoryDto> children = cat.getChildren().stream()
                    .map(child -> toDto(child, true))
                    .collect(Collectors.toList());
            builder.children(children);
        }
        return builder.build();
    }
}
