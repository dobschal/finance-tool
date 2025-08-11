export interface Category {
    id: string;
    color: string;
    name: string;
    filter: string;
    isSelected?: boolean;
}

export interface CategoryDto extends Category {
    averageBalancePerMonth?: string;
    totalBalance?: number;
    totalBalanceFormatted?: string;
    percentOfTotal?: number;
}
