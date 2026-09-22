type PayrollRow = {
    worker_id: string;
    worker_name: string;
    bagang_id: string;
    bagang_name: string;
    season_id: number;
    season_start_date: string;
    season_end_date: string | null;
};

type PayrollListResponse = {
    status: "success" | "failed";
    data: PayrollRow[];
};

export type { PayrollListResponse, PayrollRow };
