import type { ElementType, ReactNode } from 'react'
import {
  Archive,
  Banknote,
  ClipboardList,
  FileBarChart,
  Home,
  ReceiptText,
  TrendingDown,
  UserCog,
  Users,
  WalletCards,
} from 'lucide-react'

export type Role = 'dg' | 'finance' | 'compta' | 'appro' | 'commercial'
export type ScreenKey =
  | 'dashboard'
  | 'fnr'
  | 'encaissements'
  | 'decaissements'
  | 'tresorerie'
  | 'stocks'
  | 'taches'
  | 'rapports'
  | 'users'
  | 'profil'

export type Accent = 'blue' | 'cyan' | 'red' | 'green' | 'orange' | 'violet'
export type StatusTone = 'danger' | 'warning' | 'info' | 'success'

export type UserAccount = {
  id: number
  name: string
  email: string
  role: Role
  service: string
  avatar: string
  status: 'Actif' | 'Suspendu'
  lastLogin: string
}

export type WorkflowStepStatus = 'done' | 'active' | 'waiting'

export type WorkflowStep = {
  role: Role
  label: string
  status: WorkflowStepStatus
  note: string
}

export type WorkflowAlert = {
  id: number
  from: Role
  to: Role
  sentAt: string
  message: string
  response?: string
  promisedAt?: string
  priorityDecision?: 'observed' | 'forced'
  kind?: 'dg-alert' | 'reply' | 'department-message' | 'stock-auto' | 'dg-observation'
}

export type WorkflowCase = {
  id: string
  title: string
  supplier: string
  amount: string
  priority: 'Urgent' | 'Haute' | 'Moyenne'
  due: string
  dueDate: string
  createdAt: string
  currentRole: Role
  owner: string
  status: 'Bloqué' | 'En cours' | 'Retour DG' | 'Terminé'
  steps: WorkflowStep[]
  alerts: WorkflowAlert[]
}

export type StockRow = {
  reference: string
  article: string
  categorie: string
  stockReel: number
  stockDisponible: number
  seuilAlerte: number
  valeur: string
  fournisseur: string
  commandeSuggeree: number
  statut: 'Normal' | 'Faible stock' | 'Rupture'
}

export type CollectionStatus = 'À recouvrer' | 'Partiel' | 'Promesse client' | 'Recouvré' | 'À accélérer'

export type DgObservation = {
  id: number
  message: string
  urgency: 'Normal' | 'Urgent' | 'Critique'
  requestedDate: string
  status: 'Non lue' | 'Lue' | 'Traitée'
}

export type PaymentSchedule = {
  id: number
  mode: 'Espèces' | 'Chèque' | 'Traite' | 'Virement'
  amount: number
  dueDate: string
  status: 'En attente' | 'Déposé' | 'Payé' | 'À renégocier'
}

export type CollectionCase = {
  id: string
  client: string
  societe: 'TBTrade' | 'TBRetail'
  commercial: string
  totalDue: number
  assignedAmount: number
  recoveredAmount: number
  currentDueDate: string
  nextPromiseDate: string
  clientComment: string
  paymentPlan: PaymentSchedule[]
  status: CollectionStatus
  observations: DgObservation[]
}

export type SupplierCommitment = {
  id: string
  supplier: string
  department: 'Finance' | 'Appro'
  lastOrder: string
  invoice: string
  amount: number
  paidAmount: number
  paymentProof: string
  nextPaymentDate: string
  mode: 'Chèque' | 'Traite' | 'Virement'
  status: 'Payé' | 'Partiel' | 'En attente DG'
  approDecision: 'Commande autorisée' | 'Commande bloquée'
  financePlan: string
}

export type CommercialRoute = {
  commercial: string
  vehicle: string
  zone: string
  clients: string[]
  expectedRecovery: number
  todayRecovery: number
  nextDueDate: string
}

export type FilterState = {
  company: 'all' | 'TBTrade' | 'TBRetail'
  period: 'Mai 2024' | 'Avril 2024' | '2024'
  category: 'all' | 'Smartphones' | 'Accessoires'
  query: string
}

export type Column<T> = {
  key: string
  label: string
  render?: (item: T) => ReactNode
}

export const initialFilters: FilterState = {
  company: 'all',
  period: 'Mai 2024',
  category: 'all',
  query: '',
}

export const formatNumber = (value: number) =>
  new Intl.NumberFormat('fr-FR').format(value)

export const priorityRank: Record<WorkflowCase['priority'], number> = {
  Urgent: 3,
  Haute: 2,
  Moyenne: 1,
}

export const toDateInputValue = (value: string) => {
  const [day, month, year] = value.split('/')
  if (!day || !month || !year) return value
  return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

export const roleLabels: Record<Role, string> = {
  dg: 'Direction Générale',
  finance: 'Finance',
  compta: 'Comptabilité',
  appro: 'Approvisionnement',
  commercial: 'Commercial',
}

export const roleHome: Record<Role, ScreenKey> = {
  dg: 'dashboard',
  finance: 'tresorerie',
  compta: 'fnr',
  appro: 'stocks',
  commercial: 'encaissements',
}

export const rolePermissions: Record<Role, ScreenKey[]> = {
  dg: ['dashboard', 'fnr', 'encaissements', 'decaissements', 'tresorerie', 'stocks', 'taches', 'rapports', 'users', 'profil'],
  finance: ['dashboard', 'tresorerie', 'decaissements', 'taches', 'profil'],
  compta: ['dashboard', 'fnr', 'decaissements', 'taches', 'profil'],
  appro: ['dashboard', 'stocks', 'taches', 'profil'],
  commercial: ['dashboard', 'encaissements', 'taches', 'profil'],
}

export const navItems: Array<{ key: ScreenKey; label: string; icon: ElementType }> = [
  { key: 'dashboard', label: 'Dashboard', icon: Home },
  { key: 'fnr', label: 'FNR', icon: ReceiptText },
  { key: 'encaissements', label: 'Encaissements', icon: WalletCards },
  { key: 'decaissements', label: 'Décaissements', icon: TrendingDown },
  { key: 'tresorerie', label: 'Trésorerie', icon: Banknote },
  { key: 'stocks', label: 'Stocks', icon: Archive },
  { key: 'taches', label: 'Tâches', icon: ClipboardList },
  { key: 'rapports', label: 'Rapports', icon: FileBarChart },
  { key: 'users', label: 'Utilisateurs', icon: Users },
  { key: 'profil', label: 'Profil', icon: UserCog },
]

export const screens: Record<ScreenKey, { title: string; color: Accent }> = {
  dashboard: { title: 'Tableau de bord', color: 'blue' },
  fnr: { title: 'Factures Non Réglées (FNR)', color: 'blue' },
  encaissements: { title: 'Suivi des Encaissements', color: 'green' },
  decaissements: { title: 'Suivi des Décaissements', color: 'orange' },
  tresorerie: { title: 'Gestion de la Trésorerie', color: 'green' },
  stocks: { title: 'Gestion des Stocks', color: 'cyan' },
  taches: { title: 'Gestion des Tâches', color: 'violet' },
  rapports: { title: 'Rapports & Analyses', color: 'blue' },
  users: { title: 'Gestion des Utilisateurs', color: 'violet' },
  profil: { title: 'Mon Profil', color: 'blue' },
}

export const initialUsers: UserAccount[] = [
  {
    id: 1,
    name: 'Direction Générale',
    email: 'dg@tbtrade.local',
    role: 'dg',
    service: 'DG',
    avatar: 'DG',
    status: 'Actif',
    lastLogin: 'Aujourd’hui 09:12',
  },
  {
    id: 2,
    name: 'Sami Ben Ali',
    email: 'finance@tbtrade.local',
    role: 'finance',
    service: 'Finance',
    avatar: 'SB',
    status: 'Actif',
    lastLogin: 'Aujourd’hui 08:45',
  },
  {
    id: 3,
    name: 'Meriem Trabelsi',
    email: 'compta@tbtrade.local',
    role: 'compta',
    service: 'Comptabilité',
    avatar: 'MT',
    status: 'Actif',
    lastLogin: 'Hier 17:30',
  },
  {
    id: 4,
    name: 'Youssef Khalifa',
    email: 'appro@tbtrade.local',
    role: 'appro',
    service: 'Approvisionnement',
    avatar: 'YK',
    status: 'Actif',
    lastLogin: 'Aujourd’hui 10:05',
  },
  {
    id: 5,
    name: 'Nadia Saidi',
    email: 'commercial@tbtrade.local',
    role: 'commercial',
    service: 'Commercial',
    avatar: 'NS',
    status: 'Actif',
    lastLogin: 'Aujourd’hui 09:55',
  },
]

export const workflowRoles: Role[] = ['finance', 'compta', 'commercial', 'appro']

export const roleCapabilities: Record<Role, string> = {
  dg: 'Supervision globale, observations, alertes et suivi des priorités.',
  finance: 'Trésorerie, financement fournisseur, disponibilité bancaire et paiements prioritaires.',
  compta: 'Factures non réglées, contrôle facture, préparation paiement et lettrage.',
  appro: 'Stocks, commandes fournisseurs, réception et disponibilité articles.',
  commercial: 'Encaissements, recouvrement client, relances et coordination client.',
}

export const departmentSlaHours: Record<Role, number> = {
  dg: 1,
  finance: 2,
  compta: 4,
  appro: 3,
  commercial: 6,
}

export const getPrimaryUserForRole = (role: Role, accounts = initialUsers) => accounts.find((user) => user.role === role && user.status === 'Actif') ?? accounts[0]

export const initialWorkflowCases: WorkflowCase[] = [
  {
    id: 'DOS-APP-2405-018',
    title: 'Financer l’appro fournisseur A',
    supplier: 'Fournisseur A',
    amount: '120 000 TND',
    priority: 'Urgent',
    due: 'Aujourd’hui 15:00',
    dueDate: '2024-05-23T15:00:00',
    createdAt: '2024-05-23T10:15:00',
    currentRole: 'finance',
    owner: 'Sami Ben Ali',
    status: 'Bloqué',
    steps: [
      { role: 'finance', label: 'Validation financement', status: 'active', note: 'En attente du financier' },
      { role: 'compta', label: 'Contrôle facture', status: 'waiting', note: 'Après validation finance' },
      { role: 'commercial', label: 'Impact client', status: 'waiting', note: 'Validation disponibilité' },
      { role: 'appro', label: 'Commande fournisseur', status: 'waiting', note: 'À lancer après accord' },
    ],
    alerts: [
      {
        id: 1,
        from: 'dg',
        to: 'finance',
        sentAt: '10:15',
        message: 'Dossier urgent. Merci de traiter le financement dans 3h.',
      },
    ],
  },
  {
    id: 'DOS-REC-2405-011',
    title: 'Recouvrement client C',
    supplier: 'Client C',
    amount: '45 000 TND',
    priority: 'Haute',
    due: 'Demain 11:00',
    dueDate: '2024-05-24T11:00:00',
    createdAt: '2024-05-22T16:40:00',
    currentRole: 'commercial',
    owner: 'Nadia Saidi',
    status: 'En cours',
    steps: [
      { role: 'finance', label: 'Analyse solde', status: 'done', note: 'Solde confirmé' },
      { role: 'compta', label: 'Lettrage facture', status: 'done', note: 'Facture rapprochée' },
      { role: 'commercial', label: 'Relance client', status: 'active', note: 'Relance à effectuer' },
      { role: 'appro', label: 'Blocage livraison', status: 'waiting', note: 'Selon décision DG' },
    ],
    alerts: [],
  },
  {
    id: 'DOS-PAY-2405-027',
    title: 'Paiement fournisseur E',
    supplier: 'Fournisseur E',
    amount: '95 000 TND',
    priority: 'Moyenne',
    due: '30/05/2024',
    dueDate: '2024-05-30T17:00:00',
    createdAt: '2024-05-21T09:25:00',
    currentRole: 'compta',
    owner: 'Meriem Trabelsi',
    status: 'En cours',
    steps: [
      { role: 'finance', label: 'Budget disponible', status: 'done', note: 'Budget validé' },
      { role: 'compta', label: 'Préparation paiement', status: 'active', note: 'À préparer' },
      { role: 'commercial', label: 'Validation client', status: 'waiting', note: 'Non requis pour le moment' },
      { role: 'appro', label: 'Confirmation réception', status: 'waiting', note: 'Après paiement' },
    ],
    alerts: [],
  },
]

export const fnrRows = [
  ['FAC-2024-1258', 'Fournisseur A', 'TBTrade', '15/04/2024', '15/05/2024', '120 000', '16', 'En retard', 'Nadia Saidi', 'Traite', '15/05/2024'],
  ['FAC-2024-1187', 'Fournisseur B', 'TBRetail', '10/04/2024', '10/05/2024', '80 000', '21', 'En retard', 'Nadia Saidi', 'Chèque', '10/05/2024'],
  ['FAC-2024-1122', 'Fournisseur C', 'TBTrade', '05/04/2024', '05/05/2024', '210 000', '26', 'En retard', 'Sami Ben Ali', 'Traite', '05/05/2024'],
  ['FAC-2024-1045', 'Fournisseur D', 'TBRetail', '25/04/2024', '25/05/2024', '60 000', '6', 'À échéance', 'Nadia Saidi', 'Chèque', '25/05/2024'],
  ['FAC-2024-1033', 'Fournisseur E', 'TBTrade', '28/04/2024', '28/05/2024', '95 000', '3', 'À échéance', 'Meriem Trabelsi', 'Virement', '28/05/2024'],
  ['FAC-2024-0987', 'Fournisseur F', 'TBRetail', '20/04/2024', '20/05/2024', '45 000', '11', 'En retard', 'Nadia Saidi', 'Traite', '20/05/2024'],
  ['FAC-2024-0976', 'Fournisseur G', 'TBTrade', '01/05/2024', '01/06/2024', '70 000', '-', 'À venir', 'Nadia Saidi', 'Chèque', '01/06/2024'],
  ['FAC-2024-0932', 'Fournisseur H', 'TBRetail', '02/05/2024', '02/06/2024', '65 000', '-1', 'À venir', 'Sami Ben Ali', 'Virement', '02/06/2024'],
].map(([numero, fournisseur, societe, date, echeance, montant, retard, statut, commercial, modeEcheance, datePaiement]) => ({
  numero,
  fournisseur,
  societe,
  date,
  echeance,
  montant,
  retard,
  statut,
  commercial,
  modeEcheance,
  datePaiement,
}))

export const encaissements = [
  ['22/05/2024', 'REG-2024-058', 'Client A', 'TBTrade', 'Virement bancaire', '45 000', 'FAC-2024-1002'],
  ['22/05/2024', 'REG-2024-057', 'Client B', 'TBRetail', 'Chèque', '32 000', 'FAC-2024-0998'],
  ['22/05/2024', 'REG-2024-056', 'Client C', 'TBTrade', 'Espèces', '12 500', 'FAC-2024-1001'],
  ['21/05/2024', 'REG-2024-055', 'Client D', 'TBRetail', 'Virement bancaire', '85 000', 'FAC-2024-0987'],
  ['20/05/2024', 'REG-2024-054', 'Client E', 'TBTrade', 'Virement bancaire', '25 000', 'FAC-2024-0955'],
].map(([date, numero, client, societe, mode, montant, facture]) => ({
  date,
  numero,
  client,
  societe,
  mode,
  montant,
  facture,
}))

export const initialCollectionCases: CollectionCase[] = [
  {
    id: 'REC-2024-088',
    client: 'Client A',
    societe: 'TBTrade',
    commercial: 'Nadia Saidi',
    totalDue: 5000,
    assignedAmount: 2500,
    recoveredAmount: 1000,
    currentDueDate: '25/05/2024',
    nextPromiseDate: '25/08/2024',
    clientComment: 'Le client a payé 1 000 TND en espèces et demande de régler le reste sur trois échéances.',
    paymentPlan: [
      { id: 1, mode: 'Espèces', amount: 1000, dueDate: '22/05/2024', status: 'Payé' },
      { id: 2, mode: 'Chèque', amount: 1500, dueDate: '25/06/2024', status: 'En attente' },
      { id: 3, mode: 'Traite', amount: 1500, dueDate: '25/07/2024', status: 'En attente' },
      { id: 4, mode: 'Traite', amount: 1000, dueDate: '25/08/2024', status: 'À renégocier' },
    ],
    status: 'Promesse client',
    observations: [
      {
        id: 1,
        message: 'Négocier avec le client pour réduire à deux échéances au lieu de trois.',
        urgency: 'Urgent',
        requestedDate: '30/05/2024',
        status: 'Non lue',
      },
    ],
  },
  {
    id: 'REC-2024-091',
    client: 'Client D',
    societe: 'TBRetail',
    commercial: 'Nadia Saidi',
    totalDue: 85000,
    assignedAmount: 40000,
    recoveredAmount: 40000,
    currentDueDate: '24/05/2024',
    nextPromiseDate: '',
    clientComment: 'Échéance actuelle recouvrée.',
    paymentPlan: [
      { id: 1, mode: 'Virement', amount: 40000, dueDate: '24/05/2024', status: 'Payé' },
    ],
    status: 'Recouvré',
    observations: [],
  },
  {
    id: 'REC-2024-094',
    client: 'Client B',
    societe: 'TBRetail',
    commercial: 'Nadia Saidi',
    totalDue: 32000,
    assignedAmount: 16000,
    recoveredAmount: 0,
    currentDueDate: '27/05/2024',
    nextPromiseDate: '03/06/2024',
    clientComment: 'Client à relancer après confirmation comptabilité.',
    paymentPlan: [
      { id: 1, mode: 'Chèque', amount: 8000, dueDate: '03/06/2024', status: 'En attente' },
      { id: 2, mode: 'Chèque', amount: 8000, dueDate: '17/06/2024', status: 'En attente' },
    ],
    status: 'À accélérer',
    observations: [
      {
        id: 2,
        message: 'Relancer aujourd’hui et confirmer une date ferme.',
        urgency: 'Critique',
        requestedDate: '23/05/2024',
        status: 'Lue',
      },
    ],
  },
]

export const supplierCommitments: SupplierCommitment[] = [
  {
    id: 'FRS-A-2405',
    supplier: 'Fournisseur A',
    department: 'Finance',
    lastOrder: 'CMD-2024-077',
    invoice: 'FAC-2024-1258',
    amount: 120000,
    paidAmount: 120000,
    paymentProof: 'Preuve virement PAY-2024-045',
    nextPaymentDate: '15/05/2024',
    mode: 'Virement',
    status: 'Payé',
    approDecision: 'Commande autorisée',
    financePlan: 'Dernière relation soldée. Appro peut passer la commande.',
  },
  {
    id: 'FRS-E-2405',
    supplier: 'Fournisseur E',
    department: 'Finance',
    lastOrder: 'CMD-2024-081',
    invoice: 'FAC-2024-1033',
    amount: 95000,
    paidAmount: 45000,
    paymentProof: 'Facture reçue, preuve partielle PAY-2024-041',
    nextPaymentDate: '28/05/2024',
    mode: 'Traite',
    status: 'Partiel',
    approDecision: 'Commande bloquée',
    financePlan: 'Découper le solde sur 2 échéances selon recouvrement commercial du jour.',
  },
  {
    id: 'FRS-H-2405',
    supplier: 'Fournisseur H',
    department: 'Appro',
    lastOrder: 'CMD-2024-090',
    invoice: 'FAC-2024-0932',
    amount: 65000,
    paidAmount: 0,
    paymentProof: 'Aucune preuve validée',
    nextPaymentDate: '02/06/2024',
    mode: 'Chèque',
    status: 'En attente DG',
    approDecision: 'Commande bloquée',
    financePlan: 'Attendre ordre DG avant engagement bancaire.',
  },
]

export const commercialRoutes: CommercialRoute[] = [
  {
    commercial: 'Nadia Saidi',
    vehicle: 'BT-2145',
    zone: 'Tunis Nord',
    clients: ['Client A', 'Client B', 'Client D'],
    expectedRecovery: 61000,
    todayRecovery: 2500,
    nextDueDate: '25/05/2024',
  },
  {
    commercial: 'Walid Mansour',
    vehicle: 'BT-2280',
    zone: 'Cap Bon',
    clients: ['Client C', 'Client E'],
    expectedRecovery: 42000,
    todayRecovery: 0,
    nextDueDate: '27/05/2024',
  },
]

export const decaissements = [
  ['22/05/2024', 'PAY-2024-045', 'Fournisseur A', 'TBTrade', 'Virement bancaire', '60 000', 'FAC-2024-1258'],
  ['22/05/2024', 'PAY-2024-044', 'Fournisseur B', 'TBRetail', 'Chèque', '35 000', 'FAC-2024-1187'],
  ['21/05/2024', 'PAY-2024-043', 'Fournisseur C', 'TBTrade', 'Virement bancaire', '90 000', 'FAC-2024-1122'],
  ['21/05/2024', 'PAY-2024-042', 'Fournisseur D', 'TBRetail', 'Espèces', '15 000', 'FAC-2024-1045'],
  ['19/05/2024', 'PAY-2024-041', 'Fournisseur E', 'TBTrade', 'Virement bancaire', '45 000', 'FAC-2024-1033'],
].map(([date, numero, fournisseur, societe, mode, montant, facture]) => ({
  date,
  numero,
  fournisseur,
  societe,
  mode,
  montant,
  facture,
}))

export const initialStockRows: StockRow[] = [
  { reference: 'ART-001', article: 'iPhone 15 Pro 128Go', categorie: 'Smartphones', stockReel: 45, stockDisponible: 40, seuilAlerte: 15, valeur: '45 000', fournisseur: 'Fournisseur Apple', commandeSuggeree: 20, statut: 'Normal' },
  { reference: 'ART-002', article: 'Samsung S24 256Go', categorie: 'Smartphones', stockReel: 30, stockDisponible: 28, seuilAlerte: 12, valeur: '28 000', fournisseur: 'Fournisseur Samsung', commandeSuggeree: 18, statut: 'Normal' },
  { reference: 'ART-003', article: 'Écouteurs AirPods Pro', categorie: 'Accessoires', stockReel: 5, stockDisponible: 2, seuilAlerte: 10, valeur: '1 250', fournisseur: 'Fournisseur Audio', commandeSuggeree: 50, statut: 'Faible stock' },
  { reference: 'ART-004', article: 'Chargeur rapide 20W', categorie: 'Accessoires', stockReel: 0, stockDisponible: 0, seuilAlerte: 25, valeur: '0', fournisseur: 'Fournisseur Accessoires', commandeSuggeree: 80, statut: 'Rupture' },
  { reference: 'ART-005', article: 'Coque iPhone 13', categorie: 'Accessoires', stockReel: 120, stockDisponible: 110, seuilAlerte: 35, valeur: '1 800', fournisseur: 'Fournisseur Accessoires', commandeSuggeree: 40, statut: 'Normal' },
]

export const isStockUnderThreshold = (stock: StockRow) => stock.stockDisponible < stock.seuilAlerte

export const buildStockCaseId = (reference: string) => `DOS-STK-${reference}`

export function buildStockWorkflowCase(stock: StockRow, accounts = initialUsers): WorkflowCase {
  const approOwner = getPrimaryUserForRole('appro', accounts).name
  const severity = stock.stockDisponible === 0 ? 'Rupture' : 'Seuil minimum dépassé'

  return {
    id: buildStockCaseId(stock.reference),
    title: `Passation commande - ${stock.article}`,
    supplier: stock.fournisseur,
    amount: `${stock.commandeSuggeree} unité(s) suggérée(s)`,
    priority: stock.stockDisponible === 0 ? 'Urgent' : 'Haute',
    due: stock.stockDisponible === 0 ? 'Aujourd’hui 12:00' : 'Aujourd’hui 17:00',
    dueDate: stock.stockDisponible === 0 ? '2024-05-23T12:00:00' : '2024-05-23T17:00:00',
    createdAt: '2024-05-23T09:00:00',
    currentRole: 'appro',
    owner: approOwner,
    status: stock.stockDisponible === 0 ? 'Bloqué' : 'En cours',
    steps: [
      { role: 'finance', label: 'Budget commande', status: 'waiting', note: 'Après demande Appro si besoin' },
      { role: 'compta', label: 'Contrôle fournisseur', status: 'waiting', note: 'Après bon de commande' },
      { role: 'commercial', label: 'Impact ventes', status: 'waiting', note: 'Informer si rupture client' },
      { role: 'appro', label: 'Passation commande', status: 'active', note: `${stock.reference}: stock ${stock.stockDisponible}/${stock.seuilAlerte}` },
    ],
    alerts: [
      {
        id: Number(`${Date.now()}1`),
        from: 'dg',
        to: 'appro',
        sentAt: 'Auto DG',
        message: `Alerte stock automatique: ${stock.article} est à ${stock.stockDisponible}, seuil ${stock.seuilAlerte}. Merci de lancer la passation de commande.`,
        kind: 'stock-auto',
      },
      {
        id: Number(`${Date.now()}2`),
        from: 'dg',
        to: 'dg',
        sentAt: 'Auto DG',
        message: `Copie Direction: alerte ${severity} envoyée à l’Appro pour ${stock.reference}.`,
        kind: 'stock-auto',
      },
    ],
  }
}

export function mergeAutomaticStockCases(cases: WorkflowCase[], stocks: StockRow[], accounts = initialUsers) {
  const existingIds = new Set(cases.map((item) => item.id))
  const stockCases = stocks
    .filter(isStockUnderThreshold)
    .filter((stock) => !existingIds.has(buildStockCaseId(stock.reference)))
    .map((stock) => buildStockWorkflowCase(stock, accounts))

  return [...stockCases, ...cases]
}

export const reports = [
  ['Rapport FNR - Mai 2024', 'PDF', '23/05/2024 10:30', 'Sami Ben Ali'],
  ['Rapport Trésorerie - Mai 2024', 'Excel', '23/05/2024 09:15', 'Sami Ben Ali'],
  ['Rapport Stocks - Mai 2024', 'PDF', '22/05/2024 16:45', 'Youssef Khalifa'],
  ['Rapport Ventes - Mai 2024', 'Excel', '22/05/2024 15:20', 'Youssef Khalifa'],
].map(([nom, format, date, auteur]) => ({ nom, format, date, auteur }))

export const treasuryForecast = [
  ['24/05/2024', '120 000', '80 000', '1 790 000'],
  ['25/05/2024', '90 000', '70 000', '1 810 000'],
  ['26/05/2024', '150 000', '60 000', '1 900 000'],
  ['27/05/2024', '100 000', '110 000', '1 890 000'],
  ['28/05/2024', '120 000', '100 000', '1 910 000'],
  ['29/05/2024', '100 000', '80 000', '1 930 000'],
  ['30/05/2024', '-', '-', '2 010 000'],
].map(([date, encaissements, decaissements, solde]) => ({
  date,
  encaissements,
  decaissements,
  solde,
}))
