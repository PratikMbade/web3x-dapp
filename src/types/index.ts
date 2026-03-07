

export type PackageBuyResponse = {
  success: boolean;
  message: string;
    statusCode: number;
};

export type LevelIncomeTableType = {
  level: number;
  fromAddress: string;
  pacakgeNumber:number;
  amount: number;
  createdAt: string;
}

export type MatrixIncomeTableType = {
  fromAddress: string;
  packageNumber: number;
  chainNumber: number;
  amount: number;
  createdAt: string;
}

