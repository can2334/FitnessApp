export interface DashboardStats {
    dailyCalories: number;
    waterIntake: number; // ml cinsinden
    currentWorkout: string;
    weight: number;
}

export interface BodyMetrics {
    weight: number;
    fatPercentage: number;
    measurements: {
        chest?: number;
        arm?: number;
        waist?: number;
    };
}

export interface Exercise {
    name: string;
    sets: number;
    reps: number;
}