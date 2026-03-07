export interface DirectTeamMember {
  id: number
  wallet_address: string
  current_package: string
  direct_team: number
  total_team: number
  created_at?: string
  updated_at?: string
}

export interface DirectTeamTableProps {
  data: DirectTeamMember[]
  onEdit?: (member: DirectTeamMember) => void
  onDelete?: (id: number) => void
  className?: string
}

export type PackageType = "Basic" | "Premium" | "Enterprise"

export type DirectTeamTableType = {
  id: string;
  wallet_address: string;
  joined_at: string;
  current_package: number;
  direct_team_members: number;
  total_team_members: number;
  total_income: number;
};



export type LevelIncomeData = {
    tierNo: number
    percentage: number
    activeTeam: number
    totalTeam: number
    levelIncome: number
    totalLevelIncome: number
    package: number
}

export type MatrixData = {
  slotNo: number;
  slotRank: string;
  slotRankAmount: number;
  amount: number;
  totalMember: number;
  recycle: number;
  total: number;
}