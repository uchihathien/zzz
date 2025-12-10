// product/ProductImageService.java
package com.example.mecha.product;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.mecha.product.dto.ProductDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class ProductImageService {

    private static final String PRODUCT_FOLDER = "products";
    private static final int MAX_IMAGES_PER_PRODUCT = 5;

    private final Cloudinary cloudinary;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductService productService;

    @Transactional
    public ProductDto addImage(Long productId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "FILE_EMPTY");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "FILE_MUST_BE_IMAGE");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND"));

        // Kiểm tra giới hạn 5 ảnh/sản phẩm
        if (product.getImages().size() >= MAX_IMAGES_PER_PRODUCT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Sản phẩm đã có tối đa " + MAX_IMAGES_PER_PRODUCT + " ảnh. Vui lòng xóa ảnh cũ trước khi thêm mới.");
        }

        try {
            var uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", PRODUCT_FOLDER,
                            "overwrite", false,
                            "resource_type", "image"
                    )
            );

            String publicId = (String) uploadResult.get("public_id");
            String url = (String) uploadResult.get("secure_url");
            if (url == null) url = (String) uploadResult.get("url");

            int nextSortOrder = product.getImages().stream()
                    .map(ProductImage::getSortOrder)
                    .mapToInt(Integer::intValue)
                    .max()
                    .orElse(0) + 1;

            ProductImage image = ProductImage.builder()
                    .product(product)
                    .imagePublicId(publicId)
                    .imageUrl(url)
                    .sortOrder(nextSortOrder)
                    .build();

            product.addImage(image);

            // LUÔN cập nhật ảnh chính khi thêm ảnh mới
            product.setImageUrl(url);
            product.setImagePublicId(publicId);

            productRepository.save(product); // cascade lưu image

            return productService.getProduct(productId);

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "CLOUDINARY_UPLOAD_FAILED");
        }
    }

    @Transactional
    public ProductDto deleteImage(Long productId, Long imageId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND"));

        ProductImage image = product.getImages().stream()
                .filter(img -> img.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "IMAGE_NOT_FOUND"));

        // Xóa trên Cloudinary
        try {
            cloudinary.uploader().destroy(image.getImagePublicId(), ObjectUtils.emptyMap());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "CLOUDINARY_DELETE_FAILED");
        }

        boolean wasMain = image.getImageUrl().equals(product.getImageUrl());

        product.removeImage(image);

        // Nếu xoá ảnh chính → set ảnh chính sang ảnh đầu tiên còn lại (nếu có)
        if (wasMain) {
            if (!product.getImages().isEmpty()) {
                ProductImage first = product.getImages().get(0);
                product.setImageUrl(first.getImageUrl());
                product.setImagePublicId(first.getImagePublicId());
            } else {
                product.setImageUrl(null);
                product.setImagePublicId(null);
            }
        }

        productRepository.save(product);

        return productService.getProduct(productId);
    }

    /**
     * Đặt ảnh làm ảnh chính của sản phẩm
     */
    @Transactional
    public ProductDto setPrimaryImage(Long productId, Long imageId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND"));

        ProductImage image = product.getImages().stream()
                .filter(img -> img.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "IMAGE_NOT_FOUND"));

        // Cập nhật ảnh chính
        product.setImageUrl(image.getImageUrl());
        product.setImagePublicId(image.getImagePublicId());

        // Sắp xếp lại sortOrder - ảnh chính có sortOrder = 1
        int currentSort = image.getSortOrder();
        for (ProductImage img : product.getImages()) {
            if (img.getId().equals(imageId)) {
                img.setSortOrder(1);
            } else if (img.getSortOrder() < currentSort) {
                img.setSortOrder(img.getSortOrder() + 1);
            }
        }

        productRepository.save(product);

        return productService.getProduct(productId);
    }
}
