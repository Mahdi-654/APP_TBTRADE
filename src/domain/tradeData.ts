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
  collectionCaseId?: string
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

export type DirectionRecoveryNotice = {
  id: number
  dossierId: string
  client: string
  commercial: string
  paidAmount: number
  remainingAmount: number
  installments: PaymentSchedule[]
  message: string
  sentAt: string
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
  directionNotices?: DirectionRecoveryNotice[]
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
    name: 'Mahdi',
    email: 'commercial@tbtrade.local',
    role: 'commercial',
    service: 'Commercial',
    avatar: 'MA',
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
    id: 'DOS-REC-2027-001',
    title: 'Recouvrement Mytech - commande 5 000 TND',
    supplier: 'Mytech',
    amount: '5 000 TND',
    priority: 'Haute',
    due: '31/01/2027',
    dueDate: '2027-01-31T17:00:00',
    createdAt: '2026-09-08T14:00:00',
    currentRole: 'commercial',
    owner: 'Mahdi',
    status: 'En cours',
    collectionCaseId: 'REC-2027-001',
    steps: [
      { role: 'finance', label: 'Impact trésorerie', status: 'waiting', note: 'À vérifier après plan commercial' },
      { role: 'compta', label: 'Facture client', status: 'waiting', note: 'Rapprocher facture et règlement' },
      { role: 'commercial', label: 'Plan recouvrement', status: 'active', note: 'Valider le recouvrement REC-2027-001 sans ressaisie' },
      { role: 'appro', label: 'Impact livraison', status: 'waiting', note: 'Aucun blocage appro pour le test' },
    ],
    alerts: [
      {
        id: 1,
        from: 'dg',
        to: 'commercial',
        sentAt: 'Aujourd’hui 14:00',
        message: 'Tester le flux complet sur un seul dossier: commande Mytech 5 000 TND, paiement reçu 4 000 TND, reste à planifier puis notifier à la DG.',
      },
    ],
  },
]

export const fnrRows = [
  ['FAC-2027-001', 'Mytech', 'TBTrade', '08/09/2026', '31/01/2027', '5 000', '-', 'À venir', 'Mahdi', 'Chèque', '31/01/2027'],
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
  ['08/09/2026', 'REG-2027-001', 'Mytech', 'TBTrade', 'Virement bancaire', '4 000', 'FAC-2027-001'],
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
    id: 'REC-2027-001',
    client: 'Mytech',
    societe: 'TBTrade',
    commercial: 'Mahdi',
    totalDue: 5000,
    assignedAmount: 5000,
    recoveredAmount: 4000,
    currentDueDate: '31/01/2027',
    nextPromiseDate: '28/02/2027',
    clientComment: 'Mytech a payé 4 000 TND sur la commande de 5 000 TND. Le reste de 1 000 TND est planifié par Mahdi sur deux échéances distinctes.',
    paymentPlan: [
      { id: 1, mode: 'Virement', amount: 4000, dueDate: '08/09/2026', status: 'Payé' },
      { id: 2, mode: 'Chèque', amount: 500, dueDate: '31/01/2027', status: 'En attente' },
      { id: 3, mode: 'Chèque', amount: 500, dueDate: '28/02/2027', status: 'En attente' },
    ],
    status: 'Promesse client',
    observations: [],
    directionNotices: [
      {
        id: 1,
        dossierId: 'REC-2027-001',
        client: 'Mytech',
        commercial: 'Mahdi',
        paidAmount: 4000,
        remainingAmount: 1000,
        installments: [
          { id: 1, mode: 'Chèque', amount: 500, dueDate: '31/01/2027', status: 'En attente' },
          { id: 2, mode: 'Chèque', amount: 500, dueDate: '28/02/2027', status: 'En attente' },
        ],
        message: 'Notification DG: Mahdi a confirmé le même recouvrement pour Mytech: 4 000 TND payés, reste 1 000 TND en deux échéances de 500 TND.',
        sentAt: 'Aujourd’hui 14:05',
      },
    ],
  },
]

export const supplierCommitments: SupplierCommitment[] = [
  {
    id: 'FRS-TEST-2027',
    supplier: 'Fournisseur test',
    department: 'Finance',
    lastOrder: 'CMD-2027-001',
    invoice: 'FRS-2027-001',
    amount: 2000,
    paidAmount: 0,
    paymentProof: 'Engagement fournisseur à financer après recouvrement Mytech',
    nextPaymentDate: '15/01/2027',
    mode: 'Traite',
    status: 'En attente DG',
    approDecision: 'Commande bloquée',
    financePlan: 'Pression fournisseur de 2 000 TND: recommander un recouvrement client rapide et visible par la DG.',
  },
]

export const commercialRoutes: CommercialRoute[] = [
  {
    commercial: 'Mahdi',
    vehicle: 'BT-2145',
    zone: 'Tunis Nord',
    clients: ['Mytech'],
    expectedRecovery: 1000,
    todayRecovery: 4000,
    nextDueDate: '31/01/2027',
  },
]

export const decaissements = [
  ['15/01/2027', 'PAY-2027-001', 'Fournisseur test', 'TBTrade', 'Traite', '2 000', 'FRS-2027-001'],
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
  { reference: 'ART-003', article: 'Écouteurs AirPods Pro', categorie: 'Accessoires', stockReel: 18, stockDisponible: 16, seuilAlerte: 10, valeur: '4 000', fournisseur: 'Fournisseur Audio', commandeSuggeree: 20, statut: 'Normal' },
  { reference: 'ART-004', article: 'Chargeur rapide 20W', categorie: 'Accessoires', stockReel: 40, stockDisponible: 32, seuilAlerte: 25, valeur: '3 200', fournisseur: 'Fournisseur Accessoires', commandeSuggeree: 30, statut: 'Normal' },
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
