export interface CustomerProps {
    id: string;
    name: string;
    contact?: string;
    address?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CustomerResponse {
    list: CustomerProps[];
    detail: CustomerProps;
}

export interface CreateCustomerRequest {
    name: string;
    contact?: string;
    address?: string;
}

export interface UpdateCustomerRequest {
    name: string;
    contact?: string;
    address?: string;
}
