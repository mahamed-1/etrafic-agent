export interface Notification {
    id: number;
    recipient: string;
    title: string;
    message: string;
    type: 'SYSTEM'; // Seul type utilisé dans votre API
    isRead: boolean;
    metadata?: string;
    createdAt: string;
    readAt?: string;
}

export interface ApiNotificationResponse {
    totalElements: number;
    totalPages: number;
    pageable: {
        paged: boolean;
        pageNumber: number;
        pageSize: number;
        offset: number;
        sort: {
            sorted: boolean;
            empty: boolean;
            unsorted: boolean;
        };
        unpaged: boolean;
    };
    size: number;
    content: Notification[];
    number: number;
    sort: {
        sorted: boolean;
        empty: boolean;
        unsorted: boolean;
    };
    numberOfElements: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

export interface PaginatedNotifications {
    notifications: Notification[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
    isEmpty: boolean;
}
