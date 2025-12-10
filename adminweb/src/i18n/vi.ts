/**
 * Vietnamese Language File - Việt hóa giao diện admin
 */

export const vi = {
    // ==================== MENU / SIDEBAR ====================
    menu: {
        dashboard: 'Bảng điều khiển',
        ecommerce: 'Bán hàng',
        analytics: 'Phân tích',
        marketing: 'Marketing',
        crm: 'CRM',
        stocks: 'Kho hàng',
        saas: 'SaaS',
        logistics: 'Vận chuyển',

        // AI Assistant
        aiAssistant: 'Trợ lý AI',
        textGenerator: 'Tạo văn bản',
        imageGenerator: 'Tạo hình ảnh',
        codeGenerator: 'Tạo mã',
        videoGenerator: 'Tạo video',

        // Ecommerce
        products: 'Sản phẩm',
        addProduct: 'Thêm sản phẩm',
        productsList: 'Danh sách SP',
        orders: 'Đơn hàng',
        customers: 'Khách hàng',
        billing: 'Thanh toán',
        invoices: 'Hóa đơn',
        singleInvoice: 'Chi tiết hóa đơn',
        createInvoice: 'Tạo hóa đơn',
        transactions: 'Giao dịch',
        singleTransaction: 'Chi tiết giao dịch',

        // Others
        calendar: 'Lịch',
        userProfile: 'Hồ sơ cá nhân',
        task: 'Công việc',
        taskList: 'Danh sách',
        taskKanban: 'Kanban Board',
        forms: 'Biểu mẫu',
        formElements: 'Thành phần form',
        formLayout: 'Bố cục form',
        tables: 'Bảng',
        basicTables: 'Bảng cơ bản',
        dataTables: 'Bảng dữ liệu',
        pages: 'Trang',
        fileManager: 'Quản lý tệp',
        pricingTables: 'Bảng giá',
        faq: 'Câu hỏi thường gặp',
        apiKeys: 'API Keys',
        integrations: 'Tích hợp',
        blankPage: 'Trang trống',

        // Charts
        charts: 'Biểu đồ',
        lineChart: 'Biểu đồ đường',
        barChart: 'Biểu đồ cột',
        pieChart: 'Biểu đồ tròn',

        // UI Elements
        uiElements: 'Thành phần UI',
        alerts: 'Thông báo',
        avatar: 'Avatar',
        badge: 'Huy hiệu',
        breadcrumb: 'Breadcrumb',
        buttons: 'Nút bấm',
        buttonsGroup: 'Nhóm nút',
        cards: 'Thẻ',
        carousel: 'Carousel',
        dropdowns: 'Dropdown',
        images: 'Hình ảnh',
        links: 'Liên kết',
        list: 'Danh sách',
        modals: 'Modal',
        notification: 'Thông báo',
        pagination: 'Phân trang',
        popovers: 'Popover',
        progressbar: 'Thanh tiến trình',
        ribbons: 'Ribbon',
        spinners: 'Loading',
        tabs: 'Tab',
        tooltips: 'Tooltip',
        videos: 'Video',

        // Authentication
        authentication: 'Xác thực',
        signIn: 'Đăng nhập',
        signUp: 'Đăng ký',
        resetPassword: 'Đặt lại mật khẩu',
        twoStepVerification: 'Xác minh 2 bước',

        // Support
        chat: 'Trò chuyện',
        support: 'Hỗ trợ',
        supportList: 'Danh sách hỗ trợ',
        supportReply: 'Trả lời hỗ trợ',
        email: 'Email',
        inbox: 'Hộp thư đến',
        details: 'Chi tiết',

        // Section headers
        sectionMenu: 'Menu',
        sectionSupport: 'Hỗ trợ',
        sectionOthers: 'Khác',
    },

    // ==================== PAGES ====================
    pages: {
        // Product List
        productList: {
            title: 'Danh sách sản phẩm',
            subtitle: 'Quản lý tất cả sản phẩm cơ khí',
            searchPlaceholder: 'Tìm kiếm theo tên, mã sản phẩm...',
            filterByCategory: 'Lọc theo danh mục',
            allCategories: 'Tất cả danh mục',
            columns: {
                product: 'Sản phẩm',
                name: 'Tên sản phẩm',
                sku: 'Mã SP',
                category: 'Danh mục',
                price: 'Giá',
                stock: 'Tồn kho',
                unit: 'Đơn vị',
                brand: 'Thương hiệu',
                createdAt: 'Ngày tạo',
                actions: 'Thao tác',
            },
            noProducts: 'Không tìm thấy sản phẩm nào',
            showing: 'Hiển thị',
            of: 'trong số',
            results: 'kết quả',
        },

        // Add/Edit Product
        productForm: {
            addTitle: 'Thêm sản phẩm mới',
            editTitle: 'Sửa sản phẩm',
            basicInfo: 'Thông tin cơ bản',
            pricing: 'Giá và kho',
            images: 'Hình ảnh',
            attributes: 'Thuộc tính kỹ thuật',

            fields: {
                name: 'Tên sản phẩm',
                namePlaceholder: 'VD: Bulong M10x50 Thép 8.8',
                sku: 'Mã sản phẩm (SKU)',
                skuPlaceholder: 'VD: BL-M10x50-8.8',
                category: 'Danh mục',
                selectCategory: 'Chọn danh mục',
                description: 'Mô tả',
                descriptionPlaceholder: 'Nhập mô tả chi tiết sản phẩm...',
                basePrice: 'Giá cơ bản (VNĐ)',
                stockQuantity: 'Số lượng tồn kho',
                unitOfMeasure: 'Đơn vị tính',
                unitPlaceholder: 'VD: cái, bộ, kg, m',
            },

            tierPrices: {
                title: 'Giá theo số lượng',
                minQuantity: 'Từ số lượng',
                price: 'Đơn giá',
                addTier: 'Thêm mức giá',
            },

            uploadImage: 'Tải ảnh lên',
            dragDropHint: 'Kéo thả hoặc click để chọn ảnh',
        },

        // Orders
        orderList: {
            title: 'Danh sách đơn hàng',
            subtitle: 'Quản lý và theo dõi đơn hàng',
            filterByStatus: 'Trạng thái đơn hàng',
            filterByPayment: 'Trạng thái thanh toán',
            allStatuses: 'Tất cả trạng thái',
            dateRange: 'Khoảng thời gian',
            columns: {
                orderCode: 'Mã đơn',
                customer: 'Khách hàng',
                total: 'Tổng tiền',
                paymentMethod: 'Thanh toán',
                paymentStatus: 'TT Thanh toán',
                status: 'Trạng thái',
                createdAt: 'Ngày đặt',
                actions: 'Thao tác',
            },
        },

        // Customers
        customerList: {
            title: 'Danh sách khách hàng',
            subtitle: 'Quản lý thông tin khách hàng',
            searchPlaceholder: 'Tìm theo tên, email, SĐT...',
            columns: {
                name: 'Họ tên',
                email: 'Email',
                phone: 'Số điện thoại',
                role: 'Vai trò',
                status: 'Trạng thái',
                createdAt: 'Ngày đăng ký',
                actions: 'Thao tác',
            },
        },

        // Error pages
        error404: {
            title: 'Trang không tồn tại',
            message: 'Trang bạn tìm kiếm không tồn tại hoặc đã bị xóa.',
            backHome: 'Về trang chủ',
        },
        error500: {
            title: 'Lỗi máy chủ',
            message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
            backHome: 'Về trang chủ',
        },
    },

    // ==================== COMMON ACTIONS ====================
    actions: {
        save: 'Lưu',
        saveChanges: 'Lưu thay đổi',
        cancel: 'Hủy',
        delete: 'Xóa',
        edit: 'Sửa',
        view: 'Xem',
        add: 'Thêm mới',
        create: 'Tạo mới',
        update: 'Cập nhật',
        search: 'Tìm kiếm',
        filter: 'Lọc',
        reset: 'Đặt lại',
        refresh: 'Làm mới',
        export: 'Xuất file',
        import: 'Nhập file',
        download: 'Tải xuống',
        upload: 'Tải lên',
        back: 'Quay lại',
        next: 'Tiếp',
        previous: 'Trước',
        close: 'Đóng',
        confirm: 'Xác nhận',
        apply: 'Áp dụng',
        clear: 'Xóa bộ lọc',
        viewDetails: 'Xem chi tiết',
        viewAll: 'Xem tất cả',
    },

    // ==================== STATUS / ENUMS ====================
    status: {
        order: {
            PENDING: 'Chờ xử lý',
            DELIVERED: 'Hoàn thành',
            CANCELLED: 'Đã hủy',
        },
        payment: {
            PENDING: 'Chờ thanh toán',
            PAID: 'Đã thanh toán',
            FAILED: 'Thanh toán lỗi',
        },
        paymentMethod: {
            COD: 'Thanh toán khi nhận hàng',
            BANK_TRANSFER: 'Chuyển khoản',
            VNPAY: 'VNPay',
            MOMO: 'MoMo',
        },
        account: {
            ACTIVE: 'Hoạt động',
            SUSPENDED: 'Đã khóa',
            PENDING_VERIFICATION: 'Chờ xác minh',
        },
        userRole: {
            USER: 'Khách hàng',
            STAFF: 'Nhân viên',
            ADMIN: 'Quản trị viên',
            TECHNICIAN: 'Kỹ thuật viên',
        },
        booking: {
            PENDING: 'Chờ xác nhận',
            CONFIRMED: 'Đã xác nhận',
            IN_PROGRESS: 'Đang thực hiện',
            COMPLETED: 'Hoàn thành',
            CANCELLED: 'Đã hủy',
        },
    },

    // ==================== MESSAGES ====================
    messages: {
        success: {
            created: 'Tạo mới thành công!',
            updated: 'Cập nhật thành công!',
            deleted: 'Xóa thành công!',
            saved: 'Đã lưu!',
            uploaded: 'Tải lên thành công!',
        },
        error: {
            generic: 'Có lỗi xảy ra. Vui lòng thử lại.',
            notFound: 'Không tìm thấy dữ liệu.',
            unauthorized: 'Bạn không có quyền thực hiện thao tác này.',
            forbidden: 'Truy cập bị từ chối.',
            networkError: 'Lỗi kết nối mạng. Vui lòng kiểm tra internet.',
            serverError: 'Lỗi máy chủ. Vui lòng thử lại sau.',
            validationError: 'Vui lòng kiểm tra lại thông tin nhập.',
            sessionExpired: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.',
        },
        confirm: {
            delete: 'Bạn có chắc chắn muốn xóa?',
            deleteWarning: 'Hành động này không thể hoàn tác.',
            cancel: 'Bạn có chắc muốn hủy các thay đổi?',
            logout: 'Bạn có chắc muốn đăng xuất?',
        },
        loading: 'Đang tải...',
        noData: 'Không có dữ liệu',
        noResults: 'Không tìm thấy kết quả',
    },

    // ==================== AUTH ====================
    auth: {
        login: 'Đăng nhập',
        logout: 'Đăng xuất',
        register: 'Đăng ký',
        forgotPassword: 'Quên mật khẩu?',
        resetPassword: 'Đặt lại mật khẩu',
        email: 'Email',
        password: 'Mật khẩu',
        confirmPassword: 'Xác nhận mật khẩu',
        fullName: 'Họ và tên',
        phone: 'Số điện thoại',
        rememberMe: 'Ghi nhớ đăng nhập',
        loginWithGoogle: 'Đăng nhập với Google',
        dontHaveAccount: 'Chưa có tài khoản?',
        alreadyHaveAccount: 'Đã có tài khoản?',
        signUpNow: 'Đăng ký ngay',
        signInNow: 'Đăng nhập ngay',
    },

    // ==================== HEADER ====================
    header: {
        searchPlaceholder: 'Tìm kiếm...',
        notifications: 'Thông báo',
        noNotifications: 'Không có thông báo mới',
        viewAllNotifications: 'Xem tất cả thông báo',
        profile: 'Hồ sơ cá nhân',
        settings: 'Cài đặt',
        help: 'Trợ giúp',
        logout: 'Đăng xuất',
    },

    // ==================== FORM VALIDATION ====================
    validation: {
        required: 'Trường này là bắt buộc',
        email: 'Email không hợp lệ',
        minLength: 'Tối thiểu {min} ký tự',
        maxLength: 'Tối đa {max} ký tự',
        min: 'Giá trị tối thiểu là {min}',
        max: 'Giá trị tối đa là {max}',
        positive: 'Giá trị phải lớn hơn 0',
        integer: 'Giá trị phải là số nguyên',
        unique: 'Giá trị này đã tồn tại',
    },

    // ==================== COMMON LABELS ====================
    common: {
        id: 'ID',
        name: 'Tên',
        description: 'Mô tả',
        status: 'Trạng thái',
        createdAt: 'Ngày tạo',
        updatedAt: 'Ngày cập nhật',
        actions: 'Thao tác',
        total: 'Tổng cộng',
        quantity: 'Số lượng',
        price: 'Giá',
        amount: 'Thành tiền',
        date: 'Ngày',
        time: 'Giờ',
        phone: 'Số điện thoại',
        address: 'Địa chỉ',
        note: 'Ghi chú',
        image: 'Hình ảnh',
        yes: 'Có',
        no: 'Không',
        all: 'Tất cả',
        none: 'Không có',
        active: 'Hoạt động',
        inactive: 'Không hoạt động',
        enabled: 'Đã bật',
        disabled: 'Đã tắt',
    },
};

export type VietnamLocale = typeof vi;
export default vi;
