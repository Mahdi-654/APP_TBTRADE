import {
  Archive,
  Banknote,
  Bell,
  Building2,
  CalendarDays,
  ChartColumnBig,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Download,
  Eye,
  FileBarChart,
  FileSpreadsheet,
  FileText,
  Filter,
  Gauge,
  Home,
  KeyRound,
  LockKeyhole,
  LogOut,
  Mail,
  MessageSquareText,
  MoreVertical,
  PackageSearch,
  Pencil,
  Plus,
  ReceiptText,
  RefreshCcw,
  Search,
  Send,
  ShieldAlert,
  Siren,
  TrendingDown,
  TrendingUp,
  UserCog,
  Users,
  WalletCards,
  Workflow,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ElementType, FormEvent, ReactNode } from 'react'
import './App.css'

type Role = 'dg' | 'finance' | 'compta' | 'appro' | 'commercial'
type ScreenKey =
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

type Accent = 'blue' | 'cyan' | 'red' | 'green' | 'orange' | 'violet'
type StatusTone = 'danger' | 'warning' | 'info' | 'success'

type UserAccount = {
  id: number
  name: string
  email: string
  role: Role
  service: string
  avatar: string
  status: 'Actif' | 'Suspendu'
  lastLogin: string
}

type WorkflowStepStatus = 'done' | 'active' | 'waiting'

type WorkflowStep = {
  role: Role
  label: string
  status: WorkflowStepStatus
  note: string
}

type WorkflowAlert = {
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

type WorkflowCase = {
  id: string
  title: string
  supplier: string
  amount: string
  priority: 'Urgent' | 'Haute' | 'Moyenne'
  due: string
  currentRole: Role
  owner: string
  status: 'Bloqué' | 'En cours' | 'Terminé'
  steps: WorkflowStep[]
  alerts: WorkflowAlert[]
}

type StockRow = {
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

type CollectionStatus = 'À recouvrer' | 'Partiel' | 'Promesse client' | 'Recouvré' | 'À accélérer'

type DgObservation = {
  id: number
  message: string
  urgency: 'Normal' | 'Urgent' | 'Critique'
  requestedDate: string
  status: 'Non lue' | 'Lue' | 'Traitée'
}

type CollectionCase = {
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
  status: CollectionStatus
  observations: DgObservation[]
}

type FilterState = {
  company: 'all' | 'TBTrade' | 'TBRetail'
  period: 'Mai 2024' | 'Avril 2024' | '2024'
  category: 'all' | 'Smartphones' | 'Accessoires'
  query: string
}

type Column<T> = {
  key: string
  label: string
  render?: (item: T) => ReactNode
}

const initialFilters: FilterState = {
  company: 'all',
  period: 'Mai 2024',
  category: 'all',
  query: '',
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat('fr-FR').format(value)

const roleLabels: Record<Role, string> = {
  dg: 'Direction Générale',
  finance: 'Finance',
  compta: 'Comptabilité',
  appro: 'Approvisionnement',
  commercial: 'Commercial',
}

const roleHome: Record<Role, ScreenKey> = {
  dg: 'dashboard',
  finance: 'tresorerie',
  compta: 'fnr',
  appro: 'stocks',
  commercial: 'encaissements',
}

const rolePermissions: Record<Role, ScreenKey[]> = {
  dg: ['dashboard', 'fnr', 'encaissements', 'decaissements', 'tresorerie', 'stocks', 'taches', 'rapports', 'users', 'profil'],
  finance: ['dashboard', 'tresorerie', 'decaissements', 'taches', 'profil'],
  compta: ['dashboard', 'fnr', 'decaissements', 'taches', 'profil'],
  appro: ['dashboard', 'stocks', 'taches', 'profil'],
  commercial: ['dashboard', 'encaissements', 'taches', 'profil'],
}

const navItems: Array<{ key: ScreenKey; label: string; icon: ElementType }> = [
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

const screens: Record<ScreenKey, { title: string; color: Accent }> = {
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

const initialUsers: UserAccount[] = [
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

const demoCredentials = [
  ['dg@tbtrade.local', 'DG - accès global'],
  ['finance@tbtrade.local', 'Finance - règlements et contrôle'],
  ['compta@tbtrade.local', 'Compta - FNR et règlements'],
  ['appro@tbtrade.local', 'Appro - stocks et tâches'],
  ['commercial@tbtrade.local', 'Commercial - clients et recouvrement'],
]

const workflowRoles: Role[] = ['finance', 'compta', 'commercial', 'appro']

const roleCapabilities: Record<Role, string> = {
  dg: 'Supervision globale, observations, alertes et suivi des priorités.',
  finance: 'Trésorerie, financement fournisseur, disponibilité bancaire et paiements prioritaires.',
  compta: 'Factures non réglées, contrôle facture, préparation paiement et lettrage.',
  appro: 'Stocks, commandes fournisseurs, réception et disponibilité articles.',
  commercial: 'Encaissements, recouvrement client, relances et coordination client.',
}

const departmentSlaHours: Record<Role, number> = {
  dg: 1,
  finance: 2,
  compta: 4,
  appro: 3,
  commercial: 6,
}

const getPrimaryUserForRole = (role: Role, accounts = initialUsers) => accounts.find((user) => user.role === role && user.status === 'Actif') ?? accounts[0]

const initialWorkflowCases: WorkflowCase[] = [
  {
    id: 'DOS-APP-2405-018',
    title: 'Financer l’appro fournisseur A',
    supplier: 'Fournisseur A',
    amount: '120 000 TND',
    priority: 'Urgent',
    due: 'Aujourd’hui 15:00',
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

const fnrRows = [
  ['FAC-2024-1258', 'Fournisseur A', 'TBTrade', '15/04/2024', '15/05/2024', '120 000', '16', 'En retard'],
  ['FAC-2024-1187', 'Fournisseur B', 'TBRetail', '10/04/2024', '10/05/2024', '80 000', '21', 'En retard'],
  ['FAC-2024-1122', 'Fournisseur C', 'TBTrade', '05/04/2024', '05/05/2024', '210 000', '26', 'En retard'],
  ['FAC-2024-1045', 'Fournisseur D', 'TBRetail', '25/04/2024', '25/05/2024', '60 000', '6', 'À échéance'],
  ['FAC-2024-1033', 'Fournisseur E', 'TBTrade', '28/04/2024', '28/05/2024', '95 000', '3', 'À échéance'],
  ['FAC-2024-0987', 'Fournisseur F', 'TBRetail', '20/04/2024', '20/05/2024', '45 000', '11', 'En retard'],
  ['FAC-2024-0976', 'Fournisseur G', 'TBTrade', '01/05/2024', '01/06/2024', '70 000', '-', 'À venir'],
  ['FAC-2024-0932', 'Fournisseur H', 'TBRetail', '02/05/2024', '02/06/2024', '65 000', '-1', 'À venir'],
].map(([numero, fournisseur, societe, date, echeance, montant, retard, statut]) => ({
  numero,
  fournisseur,
  societe,
  date,
  echeance,
  montant,
  retard,
  statut,
}))

const encaissements = [
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

const initialCollectionCases: CollectionCase[] = [
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
    clientComment: 'Le client demande de régler le reste dans 3 mois.',
    status: 'Promesse client',
    observations: [
      {
        id: 1,
        message: 'Accélérer le recouvrement client, ne pas attendre 3 mois si possible.',
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

const decaissements = [
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

const initialStockRows: StockRow[] = [
  { reference: 'ART-001', article: 'iPhone 15 Pro 128Go', categorie: 'Smartphones', stockReel: 45, stockDisponible: 40, seuilAlerte: 15, valeur: '45 000', fournisseur: 'Fournisseur Apple', commandeSuggeree: 20, statut: 'Normal' },
  { reference: 'ART-002', article: 'Samsung S24 256Go', categorie: 'Smartphones', stockReel: 30, stockDisponible: 28, seuilAlerte: 12, valeur: '28 000', fournisseur: 'Fournisseur Samsung', commandeSuggeree: 18, statut: 'Normal' },
  { reference: 'ART-003', article: 'Écouteurs AirPods Pro', categorie: 'Accessoires', stockReel: 5, stockDisponible: 2, seuilAlerte: 10, valeur: '1 250', fournisseur: 'Fournisseur Audio', commandeSuggeree: 50, statut: 'Faible stock' },
  { reference: 'ART-004', article: 'Chargeur rapide 20W', categorie: 'Accessoires', stockReel: 0, stockDisponible: 0, seuilAlerte: 25, valeur: '0', fournisseur: 'Fournisseur Accessoires', commandeSuggeree: 80, statut: 'Rupture' },
  { reference: 'ART-005', article: 'Coque iPhone 13', categorie: 'Accessoires', stockReel: 120, stockDisponible: 110, seuilAlerte: 35, valeur: '1 800', fournisseur: 'Fournisseur Accessoires', commandeSuggeree: 40, statut: 'Normal' },
]

const isStockUnderThreshold = (stock: StockRow) => stock.stockDisponible < stock.seuilAlerte

const buildStockCaseId = (reference: string) => `DOS-STK-${reference}`

function buildStockWorkflowCase(stock: StockRow, accounts = initialUsers): WorkflowCase {
  const approOwner = getPrimaryUserForRole('appro', accounts).name
  const severity = stock.stockDisponible === 0 ? 'Rupture' : 'Seuil minimum dépassé'

  return {
    id: buildStockCaseId(stock.reference),
    title: `Passation commande - ${stock.article}`,
    supplier: stock.fournisseur,
    amount: `${stock.commandeSuggeree} unité(s) suggérée(s)`,
    priority: stock.stockDisponible === 0 ? 'Urgent' : 'Haute',
    due: stock.stockDisponible === 0 ? 'Aujourd’hui 12:00' : 'Aujourd’hui 17:00',
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

function mergeAutomaticStockCases(cases: WorkflowCase[], stocks: StockRow[], accounts = initialUsers) {
  const existingIds = new Set(cases.map((item) => item.id))
  const stockCases = stocks
    .filter(isStockUnderThreshold)
    .filter((stock) => !existingIds.has(buildStockCaseId(stock.reference)))
    .map((stock) => buildStockWorkflowCase(stock, accounts))

  return [...stockCases, ...cases]
}

const reports = [
  ['Rapport FNR - Mai 2024', 'PDF', '23/05/2024 10:30', 'Sami Ben Ali'],
  ['Rapport Trésorerie - Mai 2024', 'Excel', '23/05/2024 09:15', 'Sami Ben Ali'],
  ['Rapport Stocks - Mai 2024', 'PDF', '22/05/2024 16:45', 'Youssef Khalifa'],
  ['Rapport Ventes - Mai 2024', 'Excel', '22/05/2024 15:20', 'Youssef Khalifa'],
].map(([nom, format, date, auteur]) => ({ nom, format, date, auteur }))

const treasuryForecast = [
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

function App() {
  const [sessionUser, setSessionUser] = useState<UserAccount | null>(null)
  const [accounts, setAccounts] = useState<UserAccount[]>(initialUsers)
  const [active, setActive] = useState<ScreenKey>('dashboard')
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [message, setMessage] = useState('Prêt à connecter la base de production dès réception du clone.')
  const [stocks, setStocks] = useState<StockRow[]>(initialStockRows)
  const [workflowCases, setWorkflowCases] = useState<WorkflowCase[]>(() => mergeAutomaticStockCases(initialWorkflowCases, initialStockRows, initialUsers))
  const [departmentFocus, setDepartmentFocus] = useState<Role | 'all'>('all')
  const current = screens[active]

  const login = (email: string) => {
    const user = accounts.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.status === 'Actif') ?? accounts[0]
    setSessionUser(user)
    setActive(roleHome[user.role])
    setFilters(initialFilters)
    setMessage(`Session ${roleLabels[user.role]} ouverte.`)
  }

  const logout = () => {
    setMessage('Session fermée. Veuillez vous reconnecter.')
    setSessionUser(null)
    setActive('dashboard')
  }

  const updateProfile = (updates: Pick<UserAccount, 'name' | 'email'>) => {
    if (!sessionUser) return
    const updatedUser = { ...sessionUser, ...updates }
    setSessionUser(updatedUser)
    setAccounts(accounts.map((account) => account.id === sessionUser.id ? updatedUser : account))
    setMessage('Profil mis à jour localement.')
  }

  const changeScreen = (screen: ScreenKey) => {
    if (!sessionUser || !rolePermissions[sessionUser.role].includes(screen)) {
      setMessage('Accès refusé: ce module est réservé à un autre département.')
      return
    }
    setActive(screen)
    setMessage(`${screens[screen].title} chargé.`)
  }

  const openDepartmentService = (role: Role) => {
    if (!sessionUser || sessionUser.role !== 'dg') {
      setMessage('Accès refusé: la supervision par service est réservée à la DG.')
      return
    }
    setDepartmentFocus(role)
    setActive('taches')
    setMessage(`Service ${roleLabels[role]} ouvert avec les dossiers en charge.`)
  }

  const openApproWorkflow = () => {
    if (!sessionUser) return
    setDepartmentFocus('appro')
    setActive('taches')
    setMessage('Workflow Appro ouvert avec les alertes de stock et passations de commande.')
  }

  const createStockAlert = (stock: StockRow, mode: 'manual' | 'automatic') => {
    const caseId = buildStockCaseId(stock.reference)
    const alreadyExists = workflowCases.some((item) => item.id === caseId)

    if (alreadyExists) {
      setWorkflowCases(workflowCases.map((item) => item.id === caseId
        ? {
            ...item,
            status: stock.stockDisponible === 0 ? 'Bloqué' : item.status,
            priority: stock.stockDisponible === 0 ? 'Urgent' : item.priority,
            alerts: [
              ...item.alerts,
              {
                id: Date.now(),
                from: 'dg' as const,
                to: 'appro' as const,
                sentAt: mode === 'automatic' ? 'Auto DG' : 'Maintenant',
                message: `${mode === 'automatic' ? 'Relance automatique seuil stock' : 'Relance DG'}: ${stock.article} nécessite une commande. Stock ${stock.stockDisponible}, seuil ${stock.seuilAlerte}.`,
                kind: mode === 'automatic' ? 'stock-auto' as const : 'dg-alert' as const,
              },
              {
                id: Date.now() + 1,
                from: 'dg' as const,
                to: 'dg' as const,
                sentAt: mode === 'automatic' ? 'Auto DG' : 'Maintenant',
                message: `Trace Direction: notification Appro enregistrée pour ${stock.reference}.`,
                kind: mode === 'automatic' ? 'stock-auto' as const : 'dg-alert' as const,
              },
            ],
          }
        : item))
      setMessage(`Alerte existante renforcée pour ${stock.reference}.`)
      return
    }

    setWorkflowCases([buildStockWorkflowCase(stock, accounts), ...workflowCases])
    setDepartmentFocus('appro')
    setMessage(`Dossier stock ${caseId} créé et notifié automatiquement à l’Appro.`)
  }

  const updateStockThreshold = (reference: string, seuilAlerte: number) => {
    let nextAlertStock: StockRow | null = null
    const updatedStocks = stocks.map((stock) => {
      if (stock.reference !== reference) return stock
      const nextStock = {
        ...stock,
        seuilAlerte,
        statut: stock.stockDisponible === 0 ? 'Rupture' as const : stock.stockDisponible < seuilAlerte ? 'Faible stock' as const : 'Normal' as const,
      }
      if (isStockUnderThreshold(nextStock)) {
        nextAlertStock = nextStock
      }
      return nextStock
    })
    setStocks(updatedStocks)
    if (nextAlertStock) createStockAlert(nextAlertStock, 'automatic')
    setMessage(`Seuil stock mis à jour pour ${reference}. Surveillance automatique DG active.`)
  }

  if (!sessionUser) {
    return <LoginPage accounts={accounts} onLogin={login} message={message} />
  }

  const visibleNav = navItems.filter((item) => rolePermissions[sessionUser.role].includes(item.key))
  const notificationCount = countNotifications(workflowCases, sessionUser)

  return (
    <div className="app-shell">
      <Sidebar active={active} onChange={changeScreen} items={visibleNav} user={sessionUser} onLogout={logout} />
      <main className="workspace">
        <Topbar
          title={current.title}
          message={message}
          user={sessionUser}
          notificationCount={notificationCount}
          onLogout={logout}
          onProfile={() => changeScreen('profil')}
          onNotifications={() => changeScreen('taches')}
        />
        <section className="page" data-accent={current.color}>
          {active === 'dashboard' && <Dashboard onAction={setMessage} user={sessionUser} workflowCases={workflowCases} stocks={stocks} onOpenDepartment={openDepartmentService} onOpenScreen={changeScreen} />}
          {active === 'fnr' && <FNR filters={filters} onFiltersChange={setFilters} onAction={setMessage} />}
          {active === 'encaissements' && <Cashflow type="encaissements" filters={filters} onFiltersChange={setFilters} onAction={setMessage} user={sessionUser} />}
          {active === 'decaissements' && <Cashflow type="decaissements" filters={filters} onFiltersChange={setFilters} onAction={setMessage} user={sessionUser} />}
          {active === 'tresorerie' && <Tresorerie onAction={setMessage} />}
          {active === 'stocks' && <Stocks filters={filters} onFiltersChange={setFilters} onAction={setMessage} stocks={stocks} workflowCases={workflowCases} user={sessionUser} onCreateStockAlert={createStockAlert} onThresholdChange={updateStockThreshold} onOpenApproWorkflow={openApproWorkflow} />}
          {active === 'taches' && <Taches accounts={accounts} onAction={setMessage} user={sessionUser} workflowCases={workflowCases} setWorkflowCases={setWorkflowCases} departmentFocus={departmentFocus} onDepartmentFocusChange={setDepartmentFocus} />}
          {active === 'rapports' && <Rapports onAction={setMessage} />}
          {active === 'users' && <UsersManagement accounts={accounts} setAccounts={setAccounts} onAction={setMessage} />}
          {active === 'profil' && <Profile user={sessionUser} onSave={updateProfile} onAction={setMessage} />}
        </section>
      </main>
    </div>
  )
}

function LoginPage({ accounts, onLogin, message }: { accounts: UserAccount[]; onLogin: (email: string) => void; message: string }) {
  const [email, setEmail] = useState(accounts[0].email)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onLogin(email)
  }

  return (
    <main className="login-page">
      <section className="login-visual" aria-label="Aperçu TB Trade">
        <div className="login-brand">
          <img src="/tbtrade-logo.svg" alt="TBTrade" />
          <span>Plateforme interne</span>
          <LockKeyhole size={15} />
        </div>
        <div className="login-hero-copy">
          <span className="login-kicker">TBTrade</span>
          <strong>Gestion simple des finances, stocks et tâches.</strong>
          <small>Connexion par rôle pour accéder uniquement aux modules nécessaires.</small>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-panel-card">
          <div className="login-panel-heading">
            <span className="eyebrow">Connexion sécurisée</span>
            <h1>Accès TB Trade</h1>
            <p>Choisissez un utilisateur et entrez dans son espace.</p>
          </div>
          <form onSubmit={submit}>
            <label>
              Utilisateur
              <select value={email} onChange={(event) => setEmail(event.target.value)}>
                {accounts.filter((user) => user.status === 'Actif').map((user) => (
                  <option value={user.email} key={user.email}>
                    {user.name} - {roleLabels[user.role]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Mot de passe
              <input value="••••••••" readOnly aria-label="Mot de passe de démonstration" />
            </label>
            <button className="primary-action large" type="submit">
              <KeyRound size={16} />
              Se connecter
            </button>
          </form>
          <div className="demo-users">
            {demoCredentials.map(([login, role]) => (
              <button className={email === login ? 'selected' : undefined} key={login} type="button" onClick={() => setEmail(login)}>
                <Mail size={14} />
                <span>{login}</span>
                <small>{role}</small>
              </button>
            ))}
          </div>
          <small className="session-message">{message}</small>
        </div>
      </section>
    </main>
  )
}

function Sidebar({
  active,
  onChange,
  items,
  user,
  onLogout,
}: {
  active: ScreenKey
  onChange: (screen: ScreenKey) => void
  items: typeof navItems
  user: UserAccount
  onLogout: () => void
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img src="/tbtrade-logo.svg" alt="TBTrade" />
        <LockKeyhole size={13} />
      </div>
      <div className="session-card">
        <Avatar initials={user.avatar} />
        <span>{roleLabels[user.role]}</span>
        <strong>{user.name}</strong>
      </div>
      <nav>
        {items.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.key}
              className={active === item.key ? 'active' : ''}
              onClick={() => onChange(item.key)}
              type="button"
              title={item.label}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
      <div className="companies">
        <span>TBTrade</span>
        <span>TBRetail</span>
      </div>
      <button className="sidebar-logout" type="button" onClick={onLogout}>
        <LogOut size={15} />
        <span>Déconnexion</span>
      </button>
    </aside>
  )
}

function Topbar({
  title,
  message,
  user,
  notificationCount,
  onLogout,
  onProfile,
  onNotifications,
}: {
  title: string
  message: string
  user: UserAccount
  notificationCount: number
  onLogout: () => void
  onProfile: () => void
  onNotifications: () => void
}) {
  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        <small>{message}</small>
      </div>
      <div className="top-actions">
        <button className="icon-btn" type="button" title="Notifications" onClick={onNotifications}>
          <Bell size={16} />
          {notificationCount > 0 && <span className="notification-dot">{notificationCount}</span>}
        </button>
        <div className="topbar-brand" aria-label="TBTrade">
          <img src="/tbtrade-logo.svg" alt="" />
        </div>
        <button className="user-chip" type="button" onClick={onProfile}>
          <Avatar initials={user.avatar} />
          {user.name}
          <ChevronDown size={14} />
        </button>
        <button className="icon-btn boxed" type="button" onClick={onLogout} title="Déconnexion">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}

function Dashboard({
  onAction,
  user,
  workflowCases,
  stocks,
  onOpenDepartment,
  onOpenScreen,
}: {
  onAction: (message: string) => void
  user: UserAccount
  workflowCases: WorkflowCase[]
  stocks: StockRow[]
  onOpenDepartment: (role: Role) => void
  onOpenScreen: (screen: ScreenKey) => void
}) {
  const visibleCases = getVisibleCases(workflowCases, user)
  const stockAlerts = stocks.filter(isStockUnderThreshold)
  const blockedCases = user.role === 'dg'
    ? workflowCases.filter((item) => item.status === 'Bloqué')
    : visibleCases.filter((item) => item.currentRole === user.role)
  const pendingForRole = user.role === 'dg'
    ? workflowCases.filter((item) => item.status !== 'Terminé').length
    : workflowCases.filter((item) => item.currentRole === user.role && item.status !== 'Terminé').length

  return (
    <>
      <RoleWorkbench
        user={user}
        workflowCases={workflowCases}
        visibleCases={visibleCases}
        stockAlerts={stockAlerts}
        pendingForRole={pendingForRole}
        blockedCases={blockedCases}
        onOpenScreen={onOpenScreen}
        onOpenDepartment={onOpenDepartment}
      />
      <DashboardEssentials
        user={user}
        visibleCases={visibleCases}
        blockedCases={blockedCases}
        stockAlerts={stockAlerts}
        onOpenScreen={onOpenScreen}
        onAction={onAction}
      />
    </>
  )
}

function RoleWorkbench({
  user,
  workflowCases,
  visibleCases,
  stockAlerts,
  pendingForRole,
  blockedCases,
  onOpenScreen,
  onOpenDepartment,
}: {
  user: UserAccount
  workflowCases: WorkflowCase[]
  visibleCases: WorkflowCase[]
  stockAlerts: StockRow[]
  pendingForRole: number
  blockedCases: WorkflowCase[]
  onOpenScreen: (screen: ScreenKey) => void
  onOpenDepartment: (role: Role) => void
}) {
  const nextCase = [...visibleCases]
    .filter((item) => item.status !== 'Terminé')
    .sort((a, b) => getPriorityScore(b) - getPriorityScore(a))[0]
  const shortcuts = getRoleShortcuts(user.role)
  const activeServices = workflowRoles.map((role) => ({
    role,
    total: workflowCases.filter((item) => item.currentRole === role && item.status !== 'Terminé').length,
    blocked: workflowCases.filter((item) => item.currentRole === role && item.status === 'Bloqué').length,
  }))

  return (
    <section className="workbench">
      <div className="workbench-main">
        <span className="eyebrow">Espace {roleLabels[user.role]}</span>
        <h2>{nextCase ? getNextActionLabel(nextCase, user) : 'Tout est calme pour cette session.'}</h2>
        <p>{roleCapabilities[user.role]}</p>
        <div className="workbench-actions">
          <button className="primary-action large" type="button" onClick={() => onOpenScreen('taches')}>
            <ClipboardCheck size={16} />
            {nextCase ? 'Ouvrir mes actions' : 'Voir les tâches'}
          </button>
          <button className="secondary-action large" type="button" onClick={() => onOpenScreen(roleHome[user.role])}>
            <Home size={16} />
            Module principal
          </button>
        </div>
      </div>
      <div className="workbench-priority">
        <span className="eyebrow">Priorité</span>
        {nextCase ? (
          <>
            <strong>{nextCase.title}</strong>
            <small>{nextCase.id} - {roleLabels[nextCase.currentRole]} - {nextCase.due}</small>
            <div className="priority-meter">
              <i style={{ width: `${getPriorityScore(nextCase)}%` }} />
            </div>
            <Status value={nextCase.status} />
          </>
        ) : (
          <>
            <strong>Aucune urgence</strong>
            <small>Les modules restent disponibles dans les raccourcis.</small>
            <Status value="Flux normal" />
          </>
        )}
      </div>
      <div className="workbench-kpis">
        <article>
          <ClipboardList size={17} />
          <span>{user.role === 'dg' ? 'Dossiers actifs' : 'Mes actions'}</span>
          <strong>{pendingForRole}</strong>
        </article>
        <article>
          <ShieldAlert size={17} />
          <span>Blocages</span>
          <strong>{blockedCases.length}</strong>
        </article>
        <article>
          <PackageSearch size={17} />
          <span>Stocks alerte</span>
          <strong>{stockAlerts.length}</strong>
        </article>
      </div>
      <div className="shortcut-strip">
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon
          return (
            <button key={shortcut.screen} type="button" onClick={() => onOpenScreen(shortcut.screen)}>
              <Icon size={17} />
              <span>{shortcut.label}</span>
              <small>{shortcut.detail}</small>
            </button>
          )
        })}
      </div>
      {user.role === 'dg' && (
        <div className="service-overview">
          {activeServices.map((item) => (
            <button key={item.role} className={item.blocked > 0 ? 'blocked' : ''} type="button" onClick={() => onOpenDepartment(item.role)}>
              <strong>{roleLabels[item.role]}</strong>
              <span>{item.total} en cours</span>
              {item.blocked > 0 && <small>{item.blocked} blocage</small>}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

function DashboardEssentials({
  user,
  visibleCases,
  blockedCases,
  stockAlerts,
  onOpenScreen,
  onAction,
}: {
  user: UserAccount
  visibleCases: WorkflowCase[]
  blockedCases: WorkflowCase[]
  stockAlerts: StockRow[]
  onOpenScreen: (screen: ScreenKey) => void
  onAction: (message: string) => void
}) {
  const importantCases = [...visibleCases]
    .filter((item) => item.status !== 'Terminé')
    .sort((a, b) => getPriorityScore(b) - getPriorityScore(a))
    .slice(0, 4)

  return (
    <div className="dashboard-simple-grid">
      <Panel title={user.role === 'dg' ? 'Dossiers à surveiller' : 'Mes dossiers'}>
        <div className="simple-case-list">
          {importantCases.map((item) => (
            <button key={item.id} type="button" onClick={() => onOpenScreen('taches')}>
              <span>
                <strong>{item.title}</strong>
                <small>{item.id} - {roleLabels[item.currentRole]} - {getSlaInfo(item).label}</small>
              </span>
              <Status value={item.priority} />
            </button>
          ))}
          {importantCases.length === 0 && <p className="muted">Aucun dossier actif à traiter.</p>}
        </div>
      </Panel>
      <Panel title="Alertes simples">
        <div className="simple-alerts">
          {blockedCases.slice(0, 2).map((item) => (
            <article key={item.id}>
              <ShieldAlert size={16} />
              <span>
                <strong>{item.title}</strong>
                <small>{roleLabels[item.currentRole]} doit répondre.</small>
              </span>
            </article>
          ))}
          {stockAlerts.slice(0, 2).map((stock) => (
            <article key={stock.reference}>
              <PackageSearch size={16} />
              <span>
                <strong>{stock.article}</strong>
                <small>Stock {stock.stockDisponible} / seuil {stock.seuilAlerte}</small>
              </span>
            </article>
          ))}
          {blockedCases.length === 0 && stockAlerts.length === 0 && <p className="muted">Aucune alerte importante.</p>}
          <button className="secondary-action" type="button" onClick={() => {
            onOpenScreen(stockAlerts.length > 0 ? 'stocks' : 'taches')
            onAction('Ouverture du module lié aux alertes.')
          }}>
            Voir les détails
          </button>
        </div>
      </Panel>
    </div>
  )
}

function getRoleShortcuts(role: Role): Array<{ screen: ScreenKey; label: string; detail: string; icon: ElementType }> {
  const shared = { screen: 'taches' as const, label: 'Tâches', detail: 'À faire maintenant', icon: ClipboardList }
  const shortcuts: Record<Role, Array<{ screen: ScreenKey; label: string; detail: string; icon: ElementType }>> = {
    dg: [
      shared,
      { screen: 'tresorerie', label: 'Trésorerie', detail: 'Solde et prévisions', icon: Banknote },
      { screen: 'stocks', label: 'Stocks', detail: 'Alertes seuil', icon: Archive },
      { screen: 'users', label: 'Utilisateurs', detail: 'Accès et rôles', icon: Users },
    ],
    finance: [
      shared,
      { screen: 'tresorerie', label: 'Trésorerie', detail: 'Disponibilité bancaire', icon: Banknote },
      { screen: 'decaissements', label: 'Paiements', detail: 'À valider', icon: TrendingDown },
    ],
    compta: [
      shared,
      { screen: 'fnr', label: 'FNR', detail: 'Factures à contrôler', icon: ReceiptText },
      { screen: 'decaissements', label: 'Paiements', detail: 'Pièces et suivi', icon: TrendingDown },
    ],
    appro: [
      shared,
      { screen: 'stocks', label: 'Stocks', detail: 'Ruptures et commandes', icon: Archive },
    ],
    commercial: [
      shared,
      { screen: 'encaissements', label: 'Encaissements', detail: 'Clients et recouvrement', icon: WalletCards },
    ],
  }
  return shortcuts[role]
}

function FNR({
  filters,
  onFiltersChange,
  onAction,
}: {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onAction: (message: string) => void
}) {
  const rows = useFilteredRows(fnrRows, filters)

  return (
    <>
      <Filters search filters={filters} onChange={onFiltersChange} onAction={onAction} />
      <ModuleQuickActions
        actions={[
          ['Préparer paiement', 'Préparation paiement FNR lancée pour les factures filtrées.'],
          ['Relancer fournisseur', 'Relance fournisseur préparée sur les FNR visibles.'],
          ['Exporter FNR', 'Export FNR généré selon les filtres actifs.'],
        ]}
        onAction={onAction}
      />
      <DataTable
        emptyLabel="Aucune facture ne correspond aux filtres."
        columns={[
          { key: 'numero', label: 'N° Facture', render: (row) => <button className="link-btn" type="button" onClick={() => onAction(`Ouverture ${row.numero}`)}>{row.numero}</button> },
          { key: 'fournisseur', label: 'Fournisseur' },
          { key: 'societe', label: 'Société' },
          { key: 'date', label: 'Date facture' },
          { key: 'echeance', label: 'Échéance' },
          { key: 'montant', label: 'Montant (TND)' },
          { key: 'retard', label: 'Retard (jours)' },
          { key: 'statut', label: 'Statut', render: (row) => <Status value={row.statut} /> },
          { key: 'action', label: 'Action', render: (row) => <RowActions label={String(row.numero)} onAction={onAction} /> },
        ]}
        rows={rows}
      />
    </>
  )
}

function Cashflow({
  type,
  filters,
  onFiltersChange,
  onAction,
  user,
}: {
  type: 'encaissements' | 'decaissements'
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onAction: (message: string) => void
  user: UserAccount
}) {
  const isIncome = type === 'encaissements'
  const sourceRows: Array<Record<string, ReactNode>> = isIncome ? encaissements : decaissements
  const rows = useFilteredRows(sourceRows, filters)
  const [collectionCases, setCollectionCases] = useState(initialCollectionCases)
  const [collectionDrafts, setCollectionDrafts] = useState(() =>
    Object.fromEntries(initialCollectionCases.map((item) => [
      item.id,
      {
        recoveredAmount: String(item.recoveredAmount),
        nextPromiseDate: item.nextPromiseDate,
        clientComment: item.clientComment,
        observation: 'Accélérer le recouvrement client.',
        requestedDate: item.currentDueDate,
        urgency: 'Urgent' as DgObservation['urgency'],
      },
    ])),
  )
  const filteredCollectionCases = useMemo(() => {
    const query = filters.query.trim().toLowerCase()
    return collectionCases.filter((item) => {
      const companyMatch = filters.company === 'all' || item.societe === filters.company
      const queryMatch = !query || [item.id, item.client, item.commercial, item.status, item.clientComment].some((value) => value.toLowerCase().includes(query))
      return companyMatch && queryMatch
    })
  }, [collectionCases, filters.company, filters.query])
  const collectionTotals = useMemo(() => {
    const totalDue = filteredCollectionCases.reduce((sum, item) => sum + item.totalDue, 0)
    const assigned = filteredCollectionCases.reduce((sum, item) => sum + item.assignedAmount, 0)
    const recovered = filteredCollectionCases.reduce((sum, item) => sum + item.recoveredAmount, 0)
    const remaining = filteredCollectionCases.reduce((sum, item) => sum + getCollectionRemaining(item), 0)
    return { totalDue, assigned, recovered, remaining }
  }, [filteredCollectionCases])

  const updateDraft = (id: string, changes: Partial<typeof collectionDrafts[string]>) => {
    setCollectionDrafts({
      ...collectionDrafts,
      [id]: {
        ...collectionDrafts[id],
        ...changes,
      },
    })
  }

  const saveRecovery = (id: string) => {
    const draft = collectionDrafts[id]
    const amount = Number(draft.recoveredAmount.replace(/[^\d]/g, '')) || 0
    const target = collectionCases.find((item) => item.id === id)
    if (!target) return
    const remaining = Math.max(0, target.assignedAmount - amount)
    if (remaining > 0 && (!draft.nextPromiseDate.trim() || !draft.clientComment.trim())) {
      onAction('Recouvrement partiel: le commercial doit préciser la date promise et le commentaire client.')
      return
    }
    setCollectionCases(collectionCases.map((item) => item.id === id
      ? {
          ...item,
          recoveredAmount: Math.min(amount, item.assignedAmount),
          nextPromiseDate: remaining > 0 ? draft.nextPromiseDate : '',
          clientComment: draft.clientComment,
          status: remaining === 0 ? 'Recouvré' : 'Promesse client',
          observations: item.observations.map((observation) => observation.status === 'Non lue' ? { ...observation, status: 'Lue' as const } : observation),
        }
      : item))
    onAction(remaining === 0
      ? `Recouvrement clôturé pour ${target.client}.`
      : `Recouvrement partiel enregistré pour ${target.client}: reste ${formatNumber(remaining)} TND, prochaine promesse ${draft.nextPromiseDate}.`)
  }

  const sendDgObservation = (id: string) => {
    const draft = collectionDrafts[id]
    if (!draft.observation.trim()) {
      onAction('Observation DG vide: ajoutez une remarque avant notification.')
      return
    }
    const target = collectionCases.find((item) => item.id === id)
    setCollectionCases(collectionCases.map((item) => item.id === id
      ? {
          ...item,
          status: draft.urgency === 'Critique' ? 'À accélérer' : item.status,
          observations: [
            ...item.observations,
            {
              id: Date.now(),
              message: draft.observation,
              urgency: draft.urgency,
              requestedDate: draft.requestedDate,
              status: 'Non lue',
            },
          ],
        }
      : item))
    onAction(`Observation DG envoyée au commercial${target ? ` pour ${target.client}` : ''}.`)
  }

  return (
    <>
      <Filters search filters={filters} onChange={onFiltersChange} onAction={onAction} />
      <ModuleQuickActions
        actions={isIncome
          ? [
              ['Rapprocher règlement', 'Rapprochement des encaissements filtrés préparé.'],
              ['Relancer client', 'Relance client préparée pour les factures en retard.'],
              ['Exporter encaissements', 'Export encaissements généré selon les filtres actifs.'],
            ]
          : [
              ['Valider paiement', 'Validation paiement préparée pour les décaissements filtrés.'],
              ['Notifier DG', 'Notification DG préparée pour les décaissements sensibles.'],
              ['Exporter décaissements', 'Export décaissements généré selon les filtres actifs.'],
            ]}
        onAction={onAction}
      />
      <MetricGrid
        metrics={
          isIncome
            ? [
                { label: 'Total encaissé', value: '1 320 000 TND', trend: '+8.3% vs Avr 2024', icon: WalletCards, color: 'green' },
                { label: 'Facturé client', value: '1 180 000 TND', trend: '', icon: ChartColumnBig, color: 'blue' },
                { label: 'Avoirs / remises', value: '140 000 TND', trend: '', icon: Building2, color: 'green' },
                { label: 'Factures en retard', value: '42', trend: 'Voir la liste', icon: ShieldAlert, color: 'red' },
              ]
            : [
                { label: 'Total payé', value: '950 000 TND', trend: '-4.7% vs Avr 2024', icon: TrendingDown, color: 'red' },
                { label: 'FNR courant', value: '820 000 TND', trend: '', icon: ReceiptText, color: 'blue' },
                { label: 'Charges & frais', value: '130 000 TND', trend: '', icon: Banknote, color: 'green' },
                { label: 'Paiements à venir', value: '280 000 TND', trend: '7 prochains jours', icon: CalendarDays, color: 'blue' },
              ]
        }
      />
      {isIncome && (
        <CommercialRecovery
          cases={filteredCollectionCases}
          totals={collectionTotals}
          drafts={collectionDrafts}
          user={user}
          onDraftChange={updateDraft}
          onSaveRecovery={saveRecovery}
          onSendObservation={sendDgObservation}
        />
      )}
      <DataTable
        emptyLabel="Aucune opération ne correspond aux filtres."
        columns={
          isIncome
            ? [
                { key: 'date', label: 'Date' },
                { key: 'numero', label: 'N° règlement', render: (row) => <button className="link-btn" type="button" onClick={() => onAction(`Ouverture ${row.numero}`)}>{row.numero}</button> },
                { key: 'client', label: 'Client' },
                { key: 'societe', label: 'Société' },
                { key: 'mode', label: 'Mode paiement' },
                { key: 'montant', label: 'Montant (TND)' },
                { key: 'facture', label: 'Facture liée' },
              ]
            : [
                { key: 'date', label: 'Date' },
                { key: 'numero', label: 'N° Paiement', render: (row) => <button className="link-btn" type="button" onClick={() => onAction(`Ouverture ${row.numero}`)}>{row.numero}</button> },
                { key: 'fournisseur', label: 'Fournisseur' },
                { key: 'societe', label: 'Société' },
                { key: 'mode', label: 'Mode paiement' },
                { key: 'montant', label: 'Montant (TND)' },
                { key: 'facture', label: 'Facture liée' },
              ]
        }
        rows={rows}
      />
    </>
  )
}

function CommercialRecovery({
  cases,
  totals,
  drafts,
  user,
  onDraftChange,
  onSaveRecovery,
  onSendObservation,
}: {
  cases: CollectionCase[]
  totals: { totalDue: number; assigned: number; recovered: number; remaining: number }
  drafts: Record<string, {
    recoveredAmount: string
    nextPromiseDate: string
    clientComment: string
    observation: string
    requestedDate: string
    urgency: DgObservation['urgency']
  }>
  user: UserAccount
  onDraftChange: (id: string, changes: Partial<{
    recoveredAmount: string
    nextPromiseDate: string
    clientComment: string
    observation: string
    requestedDate: string
    urgency: DgObservation['urgency']
  }>) => void
  onSaveRecovery: (id: string) => void
  onSendObservation: (id: string) => void
}) {
  const canDeclareRecovery = user.role === 'commercial' || user.role === 'dg'
  const canObserve = user.role === 'dg'

  return (
    <section className="recovery-section">
      <div className="recovery-header">
        <div>
          <span className="eyebrow">Recouvrement commercial</span>
          <h2>FNR clients, promesses et observations DG</h2>
        </div>
        <Status value={`${cases.length} dossier(s)`} />
      </div>
      <div className="recovery-kpis">
        <article>
          <ReceiptText size={17} />
          <span>Total client</span>
          <strong>{formatNumber(totals.totalDue)} TND</strong>
        </article>
        <article>
          <ClipboardCheck size={17} />
          <span>Assigné à recouvrer</span>
          <strong>{formatNumber(totals.assigned)} TND</strong>
        </article>
        <article>
          <WalletCards size={17} />
          <span>Recouvré</span>
          <strong>{formatNumber(totals.recovered)} TND</strong>
        </article>
        <article>
          <CalendarDays size={17} />
          <span>Reste échéance</span>
          <strong>{formatNumber(totals.remaining)} TND</strong>
        </article>
      </div>
      <div className="recovery-grid">
        {cases.map((item) => {
          const remainingAssigned = getCollectionRemaining(item)
          const remainingTotal = Math.max(0, item.totalDue - item.recoveredAmount)
          const draft = drafts[item.id]
          const latestObservation = item.observations.at(-1)

          return (
            <article className="recovery-card" key={item.id}>
              <header>
                <div>
                  <span className="eyebrow">{item.id} - {item.societe}</span>
                  <h3>{item.client}</h3>
                  <p>{item.commercial} - échéance actuelle {item.currentDueDate}</p>
                </div>
                <Status value={item.status} />
              </header>
              <div className="recovery-amounts">
                <span><b>{formatNumber(item.totalDue)} TND</b>Total client</span>
                <span><b>{formatNumber(item.assignedAmount)} TND</b>À recouvrer</span>
                <span><b>{formatNumber(item.recoveredAmount)} TND</b>Recouvré</span>
                <span><b>{formatNumber(remainingAssigned)} TND</b>Reste échéance</span>
              </div>
              <div className="promise-strip">
                <CalendarDays size={15} />
                <span>
                  <strong>{remainingAssigned > 0 ? `Promesse client: ${item.nextPromiseDate || 'à préciser'}` : 'Échéance recouvrée'}</strong>
                  Reste total client: {formatNumber(remainingTotal)} TND
                </span>
              </div>
              <p className="muted">{item.clientComment}</p>
              {latestObservation && (
                <div className="dg-observation">
                  <MessageSquareText size={15} />
                  <span>
                    <strong>Observation DG - {latestObservation.urgency}</strong>
                    {latestObservation.message}
                    <small>Souhaité avant: {latestObservation.requestedDate} - {latestObservation.status}</small>
                  </span>
                </div>
              )}
              {canDeclareRecovery && (
                <form className="recovery-form" onSubmit={(event) => {
                  event.preventDefault()
                  onSaveRecovery(item.id)
                }}>
                  <label>
                    Montant recouvré
                    <input value={draft.recoveredAmount} onChange={(event) => onDraftChange(item.id, { recoveredAmount: event.target.value })} />
                  </label>
                  <label>
                    Prochaine promesse
                    <input value={draft.nextPromiseDate} onChange={(event) => onDraftChange(item.id, { nextPromiseDate: event.target.value })} />
                  </label>
                  <label>
                    Commentaire client
                    <input value={draft.clientComment} onChange={(event) => onDraftChange(item.id, { clientComment: event.target.value })} />
                  </label>
                  <button className="primary-action" type="submit">
                    <ClipboardCheck size={15} />
                    Déclarer
                  </button>
                </form>
              )}
              {canObserve && (
                <div className="dg-observation-form">
                  <label>
                    Observation DG
                    <input value={draft.observation} onChange={(event) => onDraftChange(item.id, { observation: event.target.value })} />
                  </label>
                  <label>
                    Urgence
                    <select value={draft.urgency} onChange={(event) => onDraftChange(item.id, { urgency: event.target.value as DgObservation['urgency'] })}>
                      <option>Normal</option>
                      <option>Urgent</option>
                      <option>Critique</option>
                    </select>
                  </label>
                  <label>
                    Date souhaitée
                    <input value={draft.requestedDate} onChange={(event) => onDraftChange(item.id, { requestedDate: event.target.value })} />
                  </label>
                  <button className="secondary-action" type="button" onClick={() => onSendObservation(item.id)}>
                    <Send size={15} />
                    Observer
                  </button>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

function Tresorerie({ onAction }: { onAction: (message: string) => void }) {
  return (
    <>
      <MetricGrid
        metrics={[
          { label: 'Solde bancaire actuel', value: '1 750 000 TND', trend: '', icon: Banknote, color: 'blue' },
          { label: 'Encaissements prévus (7j)', value: '680 000 TND', trend: '', icon: TrendingUp, color: 'green' },
          { label: 'Décaissements prévus (7j)', value: '420 000 TND', trend: '', icon: TrendingDown, color: 'orange' },
          { label: 'Solde prévisionnel (7j)', value: '2 010 000 TND', trend: '', icon: Gauge, color: 'green' },
        ]}
      />
      <ModuleQuickActions
        actions={[
          ['Valider prévision', 'Prévision de trésorerie validée pour la période active.'],
          ['Alerter Finance', 'Alerte Finance préparée pour contrôle de disponibilité.'],
          ['Exporter trésorerie', 'Export trésorerie généré selon la vue active.'],
        ]}
        onAction={onAction}
      />
      <div className="grid half">
        <Panel title="Évolution de la trésorerie">
          <LineChart variant="treasury" />
        </Panel>
        <Panel title="Détail des prévisions (7 prochains jours)">
          <DataTable
            compact
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'encaissements', label: 'Encaissements' },
              { key: 'decaissements', label: 'Décaissements' },
              { key: 'solde', label: 'Solde prévisionnel' },
            ]}
            rows={treasuryForecast}
          />
        </Panel>
      </div>
    </>
  )
}

function StockCommandCenter({
  stocks,
  cases,
  onOpenApproWorkflow,
  onAction,
}: {
  stocks: StockRow[]
  cases: WorkflowCase[]
  onOpenApproWorkflow: () => void
  onAction: (message: string) => void
}) {
  const stockAlerts = stocks.filter(isStockUnderThreshold)
  const stockCaseIds = new Set(stockAlerts.map((stock) => buildStockCaseId(stock.reference)))
  const activeStockCases = cases.filter((item) => stockCaseIds.has(item.id) && item.status !== 'Terminé')
  const blockedStockCases = activeStockCases.filter((item) => item.status === 'Bloqué')

  return (
    <section className="stock-command-center">
      <div className="stock-command-copy">
        <span className="eyebrow">Surveillance automatique DG</span>
        <h2>Seuil stock → notification Appro → passation commande</h2>
        <p>Chaque article inférieur au seuil crée ou relance un dossier workflow Appro, avec copie visible dans la boîte DG et historique API mock.</p>
      </div>
      <div className="stock-command-flow" aria-label="Flux visuel stock vers approvisionnement">
        <span className={stockAlerts.length > 0 ? 'active' : ''}>
          <PackageSearch size={16} />
          Seuil contrôlé
        </span>
        <i />
        <span className={activeStockCases.length > 0 ? 'active' : ''}>
          <Bell size={16} />
          DG notifiée
        </span>
        <i />
        <span className={activeStockCases.length > 0 ? 'active' : ''}>
          <Archive size={16} />
          Appro à traiter
        </span>
        <i />
        <span className={blockedStockCases.length === 0 && activeStockCases.length > 0 ? 'active' : blockedStockCases.length > 0 ? 'blocked' : ''}>
          <ClipboardCheck size={16} />
          Commande suivie
        </span>
      </div>
      <div className="stock-command-actions">
        <strong>{stockAlerts.length} alerte(s) seuil</strong>
        <small>{activeStockCases.length} dossier(s) stock en workflow, {blockedStockCases.length} bloqué(s).</small>
        <button className="primary-action" type="button" onClick={() => {
          onOpenApproWorkflow()
          onAction('Ouverture du workflow Appro pour suivre les passations de commande.')
        }}>
          <Workflow size={15} />
          Suivre Appro
        </button>
      </div>
    </section>
  )
}

function Stocks({
  filters,
  onFiltersChange,
  onAction,
  stocks,
  workflowCases,
  user,
  onCreateStockAlert,
  onThresholdChange,
  onOpenApproWorkflow,
}: {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onAction: (message: string) => void
  stocks: StockRow[]
  workflowCases: WorkflowCase[]
  user: UserAccount
  onCreateStockAlert: (stock: StockRow, mode: 'manual' | 'automatic') => void
  onThresholdChange: (reference: string, threshold: number) => void
  onOpenApproWorkflow: () => void
}) {
  const rows = useFilteredRows(stocks, filters)
  const stockAlerts = stocks.filter(isStockUnderThreshold)
  const ruptures = stocks.filter((stock) => stock.stockDisponible === 0)
  const stockValue = stocks.reduce((total, stock) => total + Number(stock.valeur.replace(/\s/g, '')), 0)
  const caseIds = new Set(workflowCases.map((item) => item.id))

  return (
    <>
      <MetricGrid
        metrics={[
          { label: 'Valeur suivie', value: `${formatNumber(stockValue)} TND`, trend: 'Articles critiques inclus', icon: Archive, color: 'cyan' },
          { label: 'Articles contrôlés', value: String(stocks.length), trend: 'Seuils actifs', icon: FileSpreadsheet, color: 'blue' },
          { label: 'Ruptures de stock', value: String(ruptures.length), trend: ruptures.length > 0 ? 'Commande obligatoire' : 'Aucune rupture', icon: ShieldAlert, color: ruptures.length > 0 ? 'red' : 'green' },
          { label: 'Alertes seuil', value: String(stockAlerts.length), trend: 'Notification auto DG → Appro', icon: PackageSearch, color: stockAlerts.length > 0 ? 'orange' : 'green' },
        ]}
      />
      <StockCommandCenter
        stocks={stocks}
        cases={workflowCases}
        onOpenApproWorkflow={onOpenApproWorkflow}
        onAction={onAction}
      />
      <Panel title="Surveillance seuils et passation de commande">
        <div className="stock-alert-grid">
          {stockAlerts.map((stock) => {
            const linkedCaseId = buildStockCaseId(stock.reference)
            const exists = caseIds.has(linkedCaseId)
            return (
              <article className={stock.stockDisponible === 0 ? 'critical' : ''} key={stock.reference}>
                <div>
                  <span className="eyebrow">{stock.reference}</span>
                  <strong>{stock.article}</strong>
                  <small>{stock.fournisseur} - stock {stock.stockDisponible} / seuil {stock.seuilAlerte}</small>
                </div>
                <Status value={stock.statut} />
                <button className="primary-action" type="button" onClick={() => onCreateStockAlert(stock, 'manual')}>
                  <Siren size={15} />
                  {exists ? 'Relancer Appro' : 'Alerter Appro'}
                </button>
              </article>
            )
          })}
          {stockAlerts.length === 0 && <p className="muted">Aucun article sous le seuil configuré.</p>}
        </div>
      </Panel>
      <Filters search category filters={filters} onChange={onFiltersChange} onAction={onAction} />
      <DataTable
        emptyLabel="Aucun article ne correspond aux filtres."
        columns={[
          { key: 'reference', label: 'Référence' },
          { key: 'article', label: 'Article' },
          { key: 'categorie', label: 'Catégorie' },
          { key: 'stockReel', label: 'Stock réel' },
          { key: 'stockDisponible', label: 'Stock dispo.' },
          {
            key: 'seuilAlerte',
            label: 'Seuil',
            render: (row) => (
              <input
                className="threshold-input"
                min={0}
                type="number"
                value={Number(row.seuilAlerte)}
                onChange={(event) => onThresholdChange(String(row.reference), Number(event.target.value))}
                aria-label={`Seuil ${row.reference}`}
              />
            ),
          },
          { key: 'valeur', label: 'Valeur (TND)' },
          { key: 'statut', label: 'Statut', render: (row) => <Status value={row.statut} /> },
          {
            key: 'action',
            label: 'Workflow',
            render: (row) => {
              const stock = stocks.find((item) => item.reference === row.reference)
              if (!stock) return null
              const linkedCaseId = buildStockCaseId(stock.reference)
              const exists = caseIds.has(linkedCaseId)
              return (
                <div className="row-actions extended">
                  <button type="button" title="Notifier Appro" onClick={() => onCreateStockAlert(stock, 'manual')}>
                    <Bell size={14} />
                  </button>
                  <button type="button" title="Voir workflow Appro" onClick={() => {
                    onOpenApproWorkflow()
                    onAction(`${exists ? linkedCaseId : 'Workflow Appro'} ouvert pour ${stock.reference}.`)
                  }}>
                    <Workflow size={14} />
                  </button>
                </div>
              )
            },
          },
        ]}
        rows={rows}
      />
      {user.role !== 'dg' && (
        <p className="muted">Votre session Appro voit uniquement les stocks, les tâches associées et le profil. La DG garde la supervision complète.</p>
      )}
    </>
  )
}

function Taches({
  accounts,
  onAction,
  user,
  workflowCases,
  setWorkflowCases,
  departmentFocus,
  onDepartmentFocusChange,
}: {
  accounts: UserAccount[]
  onAction: (message: string) => void
  user: UserAccount
  workflowCases: WorkflowCase[]
  setWorkflowCases: (cases: WorkflowCase[]) => void
  departmentFocus: Role | 'all'
  onDepartmentFocusChange: (role: Role | 'all') => void
}) {
  const [activeTab, setActiveTab] = useState('Tous')
  const [openedCaseId, setOpenedCaseId] = useState<string | null>(null)
  const [reply, setReply] = useState('Je vais le faire, sinon je propose un traitement dès que je suis disponible.')
  const [promisedAt, setPromisedAt] = useState('Aujourd’hui 14:30')
  const [draft, setDraft] = useState({
    title: 'Financer l’appro fournisseur',
    supplier: 'Fournisseur à préciser',
    amount: '0 TND',
    priority: 'Haute' as WorkflowCase['priority'],
    due: 'Aujourd’hui 17:00',
    firstRole: 'finance' as Role,
  })
  const visibleCases = useMemo(() => {
    const allowed = getVisibleCases(workflowCases, user)
    const departmentScoped = user.role === 'dg' && departmentFocus !== 'all'
      ? allowed.filter((item) => item.currentRole === departmentFocus || item.steps.some((step) => step.role === departmentFocus && step.status === 'done'))
      : allowed
    if (activeTab === 'Tous') return departmentScoped
    if (activeTab === 'À traiter') {
      return user.role === 'dg'
        ? departmentScoped.filter((item) => item.status !== 'Terminé')
        : departmentScoped.filter((item) => item.currentRole === user.role && item.status !== 'Terminé')
    }
    if (activeTab === 'Urgent') {
      return departmentScoped.filter((item) => item.priority === 'Urgent' || item.status === 'Bloqué')
    }
    if (activeTab === 'Sans réponse') {
      return departmentScoped.filter((item) => hasPendingAnswer(item, user))
    }
    return departmentScoped.filter((item) => item.status === activeTab)
  }, [activeTab, departmentFocus, user, workflowCases])
  const openedCase = openedCaseId ? workflowCases.find((item) => item.id === openedCaseId) ?? null : null

  const inboxItems = workflowCases.flatMap((item) =>
    item.alerts
      .filter((alert) => alert.to === user.role || (user.role === 'dg' && (alert.to === 'dg' || alert.response)))
      .map((alert) => ({ case: item, alert })),
  )

  const createTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const firstOwner = getPrimaryUserForRole(draft.firstRole, accounts)
    const steps = workflowRoles.map((role) => ({
      role,
      label: role === 'finance'
        ? 'Validation financement'
        : role === 'compta'
          ? 'Contrôle comptable'
          : role === 'commercial'
            ? 'Validation commerciale'
            : 'Traitement approvisionnement',
      status: role === draft.firstRole ? 'active' as const : 'waiting' as const,
      note: role === draft.firstRole ? `Tâche principale attribuée à ${firstOwner.name}` : `En attente de ${roleLabels[draft.firstRole]}`,
    }))
    const nextCase: WorkflowCase = {
      id: `DOS-DG-${Date.now().toString().slice(-6)}`,
      title: draft.title,
      supplier: draft.supplier,
      amount: draft.amount,
      priority: draft.priority,
      due: draft.due,
      currentRole: draft.firstRole,
      owner: firstOwner.name,
      status: draft.priority === 'Urgent' ? 'Bloqué' : 'En cours',
      steps,
      alerts: [
        {
          id: Date.now(),
          from: 'dg',
          to: draft.firstRole,
          sentAt: 'Maintenant',
          message: `Nouvelle tâche attribuée par la DG: ${draft.title}. Échéance ${draft.due}.`,
          kind: 'dg-alert',
        },
      ],
    }
    setWorkflowCases([nextCase, ...workflowCases])
    setActiveTab('Tous')
    onAction(`Tâche ${nextCase.id} attribuée à ${roleLabels[draft.firstRole]}.`)
  }

  const alertCase = (caseId: string) => {
    const currentCase = workflowCases.find((item) => item.id === caseId)
    if (!currentCase) return
    const updated = workflowCases.map((item) => item.id === caseId
      ? {
          ...item,
          status: 'Bloqué' as const,
          alerts: [
            ...item.alerts,
            {
              id: Date.now(),
              from: 'dg' as const,
              to: item.currentRole,
              sentAt: 'Maintenant',
              message: `Vous êtes désormais demandé pour traiter ce dossier dans 3h: ${item.title}.`,
              kind: 'dg-alert' as const,
            },
          ],
        }
      : item)
    setWorkflowCases(updated)
    onAction(`Alerte envoyée au département ${roleLabels[currentCase.currentRole]} pour ${currentCase.id}.`)
  }

  const replyToDg = (caseId: string) => {
    const updated = workflowCases.map((item) => {
      if (item.id !== caseId) return item
      const lastAlertIndex = [...item.alerts].reverse().findIndex((alert) => alert.to === user.role && !alert.response)
      if (lastAlertIndex === -1) {
        return {
          ...item,
          alerts: [
            ...item.alerts,
            {
              id: Date.now(),
              from: user.role,
              to: 'dg' as const,
              sentAt: 'Maintenant',
              message: reply,
              response: reply,
              promisedAt,
              kind: 'reply' as const,
            },
          ],
        }
      }
      const index = item.alerts.length - 1 - lastAlertIndex
      return {
        ...item,
        alerts: [
          ...item.alerts.map((alert, alertIndex) => alertIndex === index ? { ...alert, response: reply, promisedAt } : alert),
          {
            id: Date.now() + 1,
            from: user.role,
            to: 'dg' as const,
            sentAt: 'Maintenant',
            message: `Réponse enregistrée pour la DG: ${reply}. Engagement: ${promisedAt}.`,
            response: reply,
            promisedAt,
            kind: 'reply' as const,
          },
        ],
      }
    })
    setWorkflowCases(updated)
    onAction(`Réponse transmise à la DG avec engagement: ${promisedAt}.`)
  }

  const completeStep = (caseId: string) => {
    const updated = workflowCases.map((item) => {
      if (item.id !== caseId || item.currentRole !== user.role) return item
      const currentIndex = item.steps.findIndex((step) => step.role === item.currentRole)
      const nextStep = item.steps[currentIndex + 1]
      const nextOwner = nextStep ? getPrimaryUserForRole(nextStep.role, accounts).name : item.owner
      return {
        ...item,
        currentRole: nextStep?.role ?? item.currentRole,
        owner: nextOwner,
        status: nextStep ? 'En cours' as const : 'Terminé' as const,
        alerts: [
          ...item.alerts,
          {
            id: Date.now(),
            from: user.role,
            to: 'dg' as const,
            sentAt: 'Maintenant',
            message: `${user.service} a terminé son intervention sur ${item.id}.`,
            kind: 'reply' as const,
          },
          ...(nextStep ? [{
            id: Date.now() + 1,
            from: user.role,
            to: nextStep.role,
            sentAt: 'Maintenant',
            message: `Le dossier ${item.id} passe maintenant à ${roleLabels[nextStep.role]}.`,
            kind: 'department-message' as const,
          }] : []),
        ],
        steps: item.steps.map((step, index) => {
          if (index === currentIndex) return { ...step, status: 'done' as const, note: `Validé par ${user.service}` }
          if (index === currentIndex + 1) return { ...step, status: 'active' as const, note: `À traiter par ${roleLabels[step.role]}` }
          return step
        }),
      }
    })
    setWorkflowCases(updated)
    onAction(`Étape validée pour ${caseId}. Le dossier avance dans le workflow.`)
  }

  const transferCase = (caseId: string, nextRole: Role) => {
    const nextOwner = getPrimaryUserForRole(nextRole, accounts)
    const updated = workflowCases.map((item) => {
      if (item.id !== caseId) return item
      return {
        ...item,
        currentRole: nextRole,
        owner: nextOwner.name,
        status: 'En cours' as const,
        steps: workflowRoles.map((role) => ({
          role,
          label: roleLabels[role],
          status: role === nextRole ? 'active' as const : item.steps.some((step) => step.role === role && step.status === 'done') ? 'done' as const : 'waiting' as const,
          note: role === nextRole ? `Dossier transféré à ${roleLabels[role]}` : `Disponible si la DG le transfère à ${roleLabels[role]}`,
        })),
        alerts: [
          ...item.alerts,
          {
            id: Date.now(),
            from: 'dg' as const,
            to: nextRole,
            sentAt: 'Maintenant',
            message: `Dossier transféré par la DG vers ${roleLabels[nextRole]}: ${item.title}.`,
            kind: 'dg-alert' as const,
          },
        ],
      }
    })
    setWorkflowCases(updated)
    onDepartmentFocusChange(nextRole)
    setActiveTab('Tous')
    setOpenedCaseId(caseId)
    onAction(`Dossier ${caseId} transféré vers ${roleLabels[nextRole]}.`)
  }

  return (
    <>
      <SimpleTaskHeader cases={workflowCases} user={user} notifications={inboxItems.length} />
      {user.role === 'dg' && (
        <DepartmentFilter cases={workflowCases} active={departmentFocus} onChange={(role) => {
          onDepartmentFocusChange(role)
          setOpenedCaseId(null)
          onAction(role === 'all' ? 'Tous les départements affichés.' : `Dossiers ${roleLabels[role]} affichés.`)
        }} />
      )}
      {user.role === 'dg' && (
        <Panel title="Attribuer une tâche DG">
          <form className="task-assignment" onSubmit={createTask}>
            <label>
              Tâche principale
              <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
            </label>
            <label>
              Fournisseur / client
              <input value={draft.supplier} onChange={(event) => setDraft({ ...draft, supplier: event.target.value })} />
            </label>
            <label>
              Montant
              <input value={draft.amount} onChange={(event) => setDraft({ ...draft, amount: event.target.value })} />
            </label>
            <label>
              Département concerné
              <select value={draft.firstRole} onChange={(event) => setDraft({ ...draft, firstRole: event.target.value as Role })}>
                {workflowRoles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
              </select>
            </label>
            <label>
              Priorité
              <select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as WorkflowCase['priority'] })}>
                <option>Urgent</option>
                <option>Haute</option>
                <option>Moyenne</option>
              </select>
            </label>
            <label>
              Échéance
              <input value={draft.due} onChange={(event) => setDraft({ ...draft, due: event.target.value })} />
            </label>
            <button className="primary-action" type="submit">
              <Plus size={15} />
              Attribuer au département
            </button>
          </form>
        </Panel>
      )}
      <SimpleDepartmentBoard
        cases={visibleCases}
        user={user}
        onOpen={(item) => setOpenedCaseId(item.id)}
      />
      {openedCase && (
        <DossierDetailsModal
          item={openedCase}
          user={user}
        reply={reply}
        promisedAt={promisedAt}
        onReplyChange={setReply}
        onPromisedAtChange={setPromisedAt}
          onClose={() => setOpenedCaseId(null)}
          onReply={() => replyToDg(openedCase.id)}
          onComplete={() => completeStep(openedCase.id)}
          onAlert={() => alertCase(openedCase.id)}
          onTransfer={(nextRole) => transferCase(openedCase.id, nextRole)}
        />
      )}
    </>
  )
}

function SimpleTaskHeader({ cases, user, notifications }: { cases: WorkflowCase[]; user: UserAccount; notifications: number }) {
  const scoped = getVisibleCases(cases, user).filter((item) => item.status !== 'Terminé')
  const current = scoped.filter((item) => user.role === 'dg' || item.currentRole === user.role)
  const blocked = scoped.filter((item) => item.status === 'Bloqué')

  return (
    <section className="simple-task-header">
      <div>
        <span className="eyebrow">Dossiers par département</span>
        <h2>{user.role === 'dg' ? 'Choisir un dossier, puis le transférer au bon département.' : `Dossiers affectés à ${roleLabels[user.role]}.`}</h2>
        <p>Chaque département affiche des dossiers fermés. Le bouton Ouvrir affiche une seule fiche complète en popup.</p>
      </div>
      <div className="simple-task-kpis">
        <article><strong>{current.length}</strong><span>Dossiers visibles</span></article>
        <article><strong>{blocked.length}</strong><span>Blocages</span></article>
        <article><strong>{notifications}</strong><span>Messages</span></article>
      </div>
    </section>
  )
}

function DepartmentFilter({
  cases,
  active,
  onChange,
}: {
  cases: WorkflowCase[]
  active: Role | 'all'
  onChange: (role: Role | 'all') => void
}) {
  return (
    <section className="department-filter">
      <button className={active === 'all' ? 'active' : ''} type="button" onClick={() => onChange('all')}>
        Tous les dossiers
        <span>{cases.filter((item) => item.status !== 'Terminé').length}</span>
      </button>
      {workflowRoles.map((role) => (
        <button className={active === role ? 'active' : ''} key={role} type="button" onClick={() => onChange(role)}>
          {roleLabels[role]}
          <span>{cases.filter((item) => item.currentRole === role && item.status !== 'Terminé').length}</span>
        </button>
      ))}
    </section>
  )
}

function SimpleDepartmentBoard({
  cases,
  user,
  onOpen,
}: {
  cases: WorkflowCase[]
  user: UserAccount
  onOpen: (item: WorkflowCase) => void
}) {
  const departments = user.role === 'dg' ? workflowRoles : [user.role]

  return (
    <div className="department-board">
      {departments.map((role) => {
        const departmentCases = cases.filter((item) => item.currentRole === role && item.status !== 'Terminé')
        return (
          <section className="department-column" key={role}>
            <header>
              <strong>{roleLabels[role]}</strong>
              <Status value={`${departmentCases.length} dossier(s)`} />
            </header>
            <div className="department-dossiers">
              {departmentCases.map((item) => (
                <SimpleDossierBox
                  item={item}
                  key={item.id}
                  onOpen={() => onOpen(item)}
                />
              ))}
              {departmentCases.length === 0 && <p className="muted">Aucun dossier dans ce département.</p>}
            </div>
          </section>
        )
      })}
      {cases.length === 0 && <Panel title="Aucun dossier"><p className="muted">Aucun dossier à afficher.</p></Panel>}
    </div>
  )
}

function SimpleDossierBox({
  item,
  onOpen,
}: {
  item: WorkflowCase
  onOpen: () => void
}) {
  const latestMessage = item.alerts.at(-1)

  return (
    <article className="dossier-box">
      <button className="dossier-open-area" type="button" onClick={onOpen}>
        <span>
          <span className="eyebrow">{item.id}</span>
          <h3>{item.title}</h3>
          <small>{item.supplier} - {item.amount} - {item.due}</small>
          {latestMessage && <em>{latestMessage.message}</em>}
        </span>
        <span className="dossier-quick-status">
          <Status value={item.priority} />
          <Status value={item.status} />
        </span>
      </button>
      <button className="secondary-action dossier-open-button" type="button" onClick={onOpen}>
        Ouvrir
      </button>
    </article>
  )
}

function DossierDetailsModal({
  item,
  user,
  reply,
  promisedAt,
  onReplyChange,
  onPromisedAtChange,
  onClose,
  onReply,
  onComplete,
  onAlert,
  onTransfer,
}: {
  item: WorkflowCase
  user: UserAccount
  reply: string
  promisedAt: string
  onReplyChange: (value: string) => void
  onPromisedAtChange: (value: string) => void
  onClose: () => void
  onReply: () => void
  onComplete: () => void
  onAlert: () => void
  onTransfer: (role: Role) => void
}) {
  const isDg = user.role === 'dg'
  const isCurrentOwner = item.currentRole === user.role
  const sla = getSlaInfo(item)

  return (
    <div className="dossier-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="dossier-modal" role="dialog" aria-modal="true" aria-labelledby="dossier-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="dossier-modal-header">
          <div>
            <span className="eyebrow">{item.id} - {roleLabels[item.currentRole]}</span>
            <h2 id="dossier-modal-title">{item.title}</h2>
            <p>{getNextActionLabel(item, user)}</p>
          </div>
          <button className="icon-btn boxed" type="button" title="Fermer" onClick={onClose}>
            <X size={16} />
          </button>
        </header>

        <div className="dossier-modal-summary">
          <article><span>Partie</span><strong>{item.supplier}</strong></article>
          <article><span>Montant</span><strong>{item.amount}</strong></article>
          <article><span>Échéance</span><strong>{item.due}</strong></article>
          <article><span>Responsable</span><strong>{item.owner}</strong></article>
          <article><span>Priorité</span><Status value={item.priority} /></article>
          <article><span>Statut</span><Status value={item.status} /></article>
          <article><span>SLA</span><strong>{sla.detail}</strong></article>
          <article><span>Score</span><strong>{getPriorityScore(item)}/100</strong></article>
        </div>

        <div className="next-action-strip">
          <span><Gauge size={15} /> Action</span>
          <strong>{getNextActionLabel(item, user)}</strong>
          <small>{sla.label}</small>
        </div>

        {item.id.startsWith('DOS-STK') && (
          <div className="stock-order-note">
            <PackageSearch size={16} />
            <span>
              <strong>Commande suggérée</strong>
              {item.amount} - fournisseur: {item.supplier}
            </span>
          </div>
        )}

        <div className="dossier-modal-section">
          <h3>Parcours par département</h3>
          <div className="workflow-steps">
            {item.steps.map((step) => (
              <article className={`workflow-step ${step.status}`} key={step.role}>
                <span>{roleLabels[step.role]}</span>
                <strong>{step.label}</strong>
                <small>{step.note}</small>
              </article>
            ))}
          </div>
        </div>

        <div className="dossier-modal-section">
          <h3>Historique et messages</h3>
          <div className="message-thread">
            {item.alerts.map((alert) => (
              <article key={alert.id}>
                <MessageSquareText size={15} />
                <span>
                  <strong>{roleLabels[alert.from]} vers {roleLabels[alert.to]} - {alert.sentAt}</strong>
                  <p>{alert.message}</p>
                  {alert.response && <small>Réponse: {alert.response}</small>}
                  {alert.promisedAt && <small>Engagement: {alert.promisedAt}</small>}
                </span>
              </article>
            ))}
            {item.alerts.length === 0 && <p className="muted">Aucun message enregistré.</p>}
          </div>
        </div>

        {isDg ? (
          <div className="dg-action-box">
            <strong>Décision Direction Générale</strong>
            <span>Transférer ce dossier vers un seul département.</span>
            <div className="transfer-buttons">
              {workflowRoles.map((role) => (
                <button disabled={role === item.currentRole} key={role} type="button" onClick={() => onTransfer(role)}>
                  {roleLabels[role]}
                </button>
              ))}
            </div>
            <button className="secondary-action danger" type="button" onClick={onAlert}>
              <Bell size={15} />
              Relancer le département actuel
            </button>
          </div>
        ) : (
          <div className="department-reply">
            <label>
              Réponse à la DG
              <input value={reply} onChange={(event) => onReplyChange(event.target.value)} />
            </label>
            <label>
              Engagement
              <input value={promisedAt} onChange={(event) => onPromisedAtChange(event.target.value)} />
            </label>
            <div className="workflow-actions">
              <button className="secondary-action" type="button" onClick={onReply}>
                <Send size={15} />
                Répondre
              </button>
              {isCurrentOwner && (
                <button className="primary-action" type="button" onClick={onComplete}>
                  <ClipboardCheck size={15} />
                  Dossier traité
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function ModuleQuickActions({
  actions,
  onAction,
}: {
  actions: Array<[string, string]>
  onAction: (message: string) => void
}) {
  return (
    <div className="module-actions">
      {actions.map(([label, message]) => (
        <button className="secondary-action" key={label} type="button" onClick={() => onAction(message)}>
          <CheckCircle2 size={15} />
          {label}
        </button>
      ))}
    </div>
  )
}

function Rapports({ onAction }: { onAction: (message: string) => void }) {
  const available = [
    ['Rapport FNR', FileText, 'blue'],
    ['Rapport Encaissements', WalletCards, 'green'],
    ['Rapport Décaissements', TrendingDown, 'orange'],
    ['Rapport Trésorerie', FileSpreadsheet, 'blue'],
    ['Rapport Stocks', Archive, 'green'],
    ['Rapport Ventes', ChartColumnBig, 'violet'],
  ] as const

  return (
    <>
      <Panel title="Rapports disponibles">
        <div className="report-grid">
          {available.map(([label, Icon, color]) => (
            <button className="report-card" data-color={color} key={label} type="button" onClick={() => onAction(`${label} généré en mode démonstration.`)}>
              <Icon size={30} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </Panel>
      <Panel title="Rapports récents">
        <DataTable
          compact
          columns={[
            { key: 'nom', label: 'Rapport' },
            { key: 'format', label: 'Format', render: (row) => <Status value={row.format} /> },
            { key: 'date', label: 'Date' },
            { key: 'auteur', label: 'Auteur' },
            { key: 'action', label: '', render: (row) => <RowActions label={String(row.nom)} onAction={onAction} /> },
          ]}
          rows={reports}
        />
      </Panel>
    </>
  )
}

function UsersManagement({
  accounts,
  setAccounts,
  onAction,
}: {
  accounts: UserAccount[]
  setAccounts: (accounts: UserAccount[]) => void
  onAction: (message: string) => void
}) {
  const [draft, setDraft] = useState({
    name: 'Nouvel utilisateur',
    email: 'user@tbtrade.local',
    role: 'finance' as Role,
  })

  const createUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const initials = draft.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'NU'
    const nextUser: UserAccount = {
      id: Date.now(),
      name: draft.name,
      email: draft.email,
      role: draft.role,
      service: roleLabels[draft.role],
      avatar: initials,
      status: 'Actif',
      lastLogin: 'Jamais connecté',
    }
    setAccounts([nextUser, ...accounts])
    onAction(`Utilisateur ${nextUser.name} créé pour ${roleLabels[nextUser.role]}.`)
  }

  const toggleStatus = (id: number) => {
    const target = accounts.find((account) => account.id === id)
    if (!target || target.role === 'dg') {
      onAction('Le compte DG principal ne peut pas être suspendu.')
      return
    }
    const nextStatus = target.status === 'Actif' ? 'Suspendu' : 'Actif'
    setAccounts(accounts.map((account) => account.id === id ? { ...account, status: nextStatus } : account))
    onAction(`Compte ${target.name}: ${nextStatus}.`)
  }

  return (
    <>
      <MetricGrid
        metrics={[
          { label: 'Utilisateurs actifs', value: String(accounts.filter((user) => user.status === 'Actif').length), trend: 'DG, Finance, Compta, Appro, Commercial', icon: Users, color: 'blue' },
          { label: 'Sessions principales', value: String(new Set(accounts.map((user) => user.role)).size), trend: 'Menus adaptés par rôle', icon: ClipboardCheck, color: 'green' },
          { label: 'Profils protégés', value: '100%', trend: 'Déconnexion disponible', icon: LockKeyhole, color: 'violet' },
        ]}
      />
      <Panel title="Créer un utilisateur">
        <form className="user-management-form" onSubmit={createUser}>
          <label>
            Nom complet
            <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          </label>
          <label>
            Email
            <input value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
          </label>
          <label>
            Département
            <select value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value as Role })}>
              {Object.entries(roleLabels).map(([role, label]) => (
                <option key={role} value={role}>{label}</option>
              ))}
            </select>
          </label>
          <button className="primary-action" type="submit">
            <Plus size={15} />
            Ajouter
          </button>
        </form>
      </Panel>
      <Panel title="Comptes applicatifs">
        <DataTable
          compact
          columns={[
            { key: 'name', label: 'Utilisateur', render: (row) => <UserCell initials={String(row.avatar)} name={String(row.name)} email={String(row.email)} /> },
            { key: 'service', label: 'Service' },
            { key: 'role', label: 'Rôle', render: (row) => <Status value={roleLabels[row.role as Role]} /> },
            { key: 'status', label: 'Statut', render: (row) => <Status value={row.status} /> },
            { key: 'lastLogin', label: 'Dernière connexion' },
            {
              key: 'action',
              label: 'Action',
              render: (row) => (
                <div className="row-actions extended">
                  <button type="button" title="Voir" onClick={() => onAction(`Profil utilisateur ouvert: ${row.name}`)}>
                    <Eye size={14} />
                  </button>
                  <button type="button" title="Réinitialiser mot de passe" onClick={() => onAction(`Réinitialisation mot de passe préparée pour ${row.name}.`)}>
                    <KeyRound size={14} />
                  </button>
                  <button type="button" title={row.status === 'Actif' ? 'Suspendre' : 'Activer'} onClick={() => toggleStatus(Number(row.id))}>
                    {row.status === 'Actif' ? <LockKeyhole size={14} /> : <CheckCircle2 size={14} />}
                  </button>
                </div>
              ),
            },
          ]}
          rows={accounts}
        />
      </Panel>
    </>
  )
}

function Profile({
  user,
  onSave,
  onAction,
}: {
  user: UserAccount
  onSave: (updates: Pick<UserAccount, 'name' | 'email'>) => void
  onAction: (message: string) => void
}) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSave({ name, email })
  }

  return (
    <div className="profile-layout">
      <Panel title="Informations du profil">
        <form className="profile-form" onSubmit={submit}>
          <div className="profile-header">
            <Avatar initials={user.avatar} large />
            <div>
              <strong>{name}</strong>
              <span>{roleLabels[user.role]}</span>
            </div>
          </div>
          <label>
            Nom complet
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Rôle
            <input value={roleLabels[user.role]} readOnly />
          </label>
          <button className="primary-action large" type="submit">
            <Pencil size={15} />
            Enregistrer le profil
          </button>
        </form>
      </Panel>
      <Panel title="Sécurité de session">
        <div className="security-list">
          <span><LockKeyhole size={16} /> Session principale: {roleLabels[user.role]}</span>
          <span><ShieldAlert size={16} /> Permissions limitées au rôle</span>
          <span><RefreshCcw size={16} /> Prêt pour branchement backend/API</span>
          <button className="secondary-action" type="button" onClick={() => onAction('Demande de réinitialisation préparée.')}>
            <KeyRound size={15} />
            Réinitialiser le mot de passe
          </button>
        </div>
      </Panel>
    </div>
  )
}

function Filters({
  compact,
  search,
  category,
  filters,
  onChange,
  onAction,
}: {
  compact?: boolean
  search?: boolean
  category?: boolean
  filters: FilterState
  onChange: (filters: FilterState) => void
  onAction: (message: string) => void
}) {
  const update = (changes: Partial<FilterState>) => onChange({ ...filters, ...changes })

  return (
    <div className={`filters ${compact ? 'compact' : ''}`}>
      <label>
        Société
        <select value={filters.company} onChange={(event) => update({ company: event.target.value as FilterState['company'] })}>
          <option value="all">Les deux sociétés</option>
          <option value="TBTrade">TBTrade</option>
          <option value="TBRetail">TBRetail</option>
        </select>
      </label>
      <label>
        Période
        <select value={filters.period} onChange={(event) => update({ period: event.target.value as FilterState['period'] })}>
          <option>Mai 2024</option>
          <option>Avril 2024</option>
          <option>2024</option>
        </select>
      </label>
      {category && (
        <label>
          Catégorie
          <select value={filters.category} onChange={(event) => update({ category: event.target.value as FilterState['category'] })}>
            <option value="all">Toutes</option>
            <option>Smartphones</option>
            <option>Accessoires</option>
          </select>
        </label>
      )}
      {search && (
        <label className="search-field">
          <Search size={15} />
          <input value={filters.query} placeholder="Rechercher..." onChange={(event) => update({ query: event.target.value })} />
        </label>
      )}
      <button type="button" className="secondary-action" onClick={() => onAction('Export préparé selon les filtres actifs.')}>
        <Download size={15} />
        Exporter
      </button>
      <button type="button" className="primary-action" onClick={() => onAction('Filtres appliqués.')}>
        <Filter size={15} />
        Appliquer
      </button>
      <button type="button" className="icon-btn boxed" title="Réinitialiser les filtres" onClick={() => {
        onChange(initialFilters)
        onAction('Filtres réinitialisés.')
      }}>
        <RefreshCcw size={15} />
      </button>
    </div>
  )
}

function MetricGrid({
  metrics,
}: {
  metrics: Array<{
    label: string
    value: string
    trend: string
    icon: ElementType
    color: Accent
  }>
}) {
  return (
    <div className="metric-grid" style={{ gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))` }}>
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <article className="metric-card" key={metric.label} data-color={metric.color}>
            <Icon size={23} />
            <div>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              {metric.trend && <small>{metric.trend}</small>}
            </div>
          </article>
        )
      })}
    </div>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function DataTable({
  columns,
  rows,
  compact,
  emptyLabel = 'Aucune donnée à afficher.',
}: {
  columns: Array<Column<Record<string, ReactNode>>>
  rows: Array<Record<string, ReactNode>>
  compact?: boolean
  emptyLabel?: string
}) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(compact ? 6 : 5)
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const displayRows = rows.slice((safePage - 1) * pageSize, safePage * pageSize)

  return (
    <div className={`table-shell ${compact ? 'compact' : ''}`}>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="empty-cell">{emptyLabel}</td>
            </tr>
          )}
          {displayRows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={String(column.key)}>
                  {column.render ? column.render(row) : column.key === 'action' ? null : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!compact && (
        <div className="pagination">
          <span className="page-buttons">
            <button type="button" disabled={safePage === 1} onClick={() => setPage(Math.max(1, safePage - 1))}>
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: pageCount }).map((_, index) => (
              <button
                key={index + 1}
                className={safePage === index + 1 ? 'active' : ''}
                type="button"
                onClick={() => setPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button type="button" disabled={safePage === pageCount} onClick={() => setPage(Math.min(pageCount, safePage + 1))}>
              <ChevronRight size={15} />
            </button>
          </span>
          <label className="page-size">
            Lignes
            <select value={pageSize} onChange={(event) => {
              setPageSize(Number(event.target.value))
              setPage(1)
            }}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>
          <span>Affichage: {displayRows.length} / {rows.length} ligne(s)</span>
        </div>
      )}
    </div>
  )
}

function Status({ value }: { value: ReactNode }) {
  const text = String(value)
  const className = useMemo<StatusTone>(() => {
    if (['En retard', 'Haute', 'Urgent', 'Bloqué', 'Rupture', 'PDF', 'Suspendu', 'Priorité obligatoire', 'Hors SLA', 'Critique', 'Action obligatoire', 'Blocage rouge DG', 'Escalade immédiate', 'À accélérer', 'Non lue'].includes(text)) return 'danger'
    if (['À échéance', 'Moyenne', 'Faible stock', 'Délai noté', 'À surveiller', 'Relance automatique', 'Promesse client', 'Partiel'].includes(text)) return 'warning'
    if (['À venir', 'En cours', 'Excel', 'Direction Générale', 'Finance', 'Comptabilité', 'Approvisionnement', 'Commercial', 'Information', 'Réponse reçue', 'À recouvrer', 'Lue'].includes(text) || text.startsWith('SLA ')) return 'info'
    return 'success'
  }, [text])

  return <span className={`status ${className}`}>{text}</span>
}

function getCollectionRemaining(item: CollectionCase) {
  return Math.max(0, item.assignedAmount - item.recoveredAmount)
}

function RowActions({ label, onAction }: { label: string; onAction: (message: string) => void }) {
  return (
    <div className="row-actions">
      <button type="button" title="Voir" onClick={() => onAction(`Consultation: ${label}`)}>
        <Eye size={14} />
      </button>
      <button type="button" title="Plus" onClick={() => onAction(`Menu actions: ${label}`)}>
        <MoreVertical size={14} />
      </button>
    </div>
  )
}

function Avatar({ initials, large }: { initials: string; large?: boolean }) {
  return <span className={`avatar ${large ? 'large' : ''}`}>{initials}</span>
}

function UserCell({ initials, name, email }: { initials: string; name: string; email: string }) {
  return (
    <span className="user-cell">
      <Avatar initials={initials} />
      <span>
        <strong>{name}</strong>
        <small>{email}</small>
      </span>
    </span>
  )
}

function useFilteredRows<T extends Record<string, ReactNode>>(rows: T[], filters: FilterState) {
  return useMemo(() => {
    const query = filters.query.trim().toLowerCase()
    return rows.filter((row) => {
      const companyMatch = filters.company === 'all' || row.societe === filters.company
      const categoryMatch = filters.category === 'all' || row.categorie === filters.category
      const queryMatch = !query || Object.values(row).some((value) => String(value).toLowerCase().includes(query))
      return companyMatch && categoryMatch && queryMatch
    })
  }, [filters, rows])
}

function LineChart({ variant = 'sales' }: { variant?: 'sales' | 'treasury' }) {
  const points = variant === 'sales' ? [38, 48, 63, 55, 70, 76, 66, 79, 68, 74, 88] : [72, 50, 69, 62, 79, 74, 82, 78, 84, 95]
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${index * 46 + 8} ${112 - point}`).join(' ')

  return (
    <svg className="line-chart" viewBox="0 0 500 150" role="img" aria-label="Courbe d'évolution">
      <g className="grid-lines">
        {[20, 50, 80, 110, 140].map((y) => (
          <line key={y} x1="0" x2="500" y1={y} y2={y} />
        ))}
      </g>
      <path d={path} />
      {variant === 'sales' && <path className="secondary" d="M 8 96 L 54 88 L 100 78 L 146 82 L 192 75 L 238 64 L 284 58 L 330 70 L 376 68 L 422 76 L 468 80" />}
      {points.map((point, index) => (
        <circle key={index} cx={index * 46 + 8} cy={112 - point} r="4" />
      ))}
    </svg>
  )
}

function hasPendingAnswer(item: WorkflowCase, user: UserAccount) {
  if (user.role === 'dg') {
    return item.alerts.some((alert) => alert.to !== 'dg' && !alert.response && alert.kind === 'dg-alert')
      || item.alerts.some((alert) => alert.to === 'dg' || alert.response)
  }
  return item.alerts.some((alert) => alert.to === user.role && !alert.response)
}

function getNextActionLabel(item: WorkflowCase, user: UserAccount) {
  if (item.status === 'Terminé') return 'Dossier terminé, historique disponible.'
  if (user.role === 'dg') {
    const lastReply = item.alerts.findLast((alert) => alert.response || alert.to === 'dg')
    if (lastReply?.promisedAt) return `Décider sur le délai proposé: ${lastReply.promisedAt}.`
    if (item.status === 'Bloqué') return `Arbitrer ou relancer ${roleLabels[item.currentRole]}.`
    return `Suivre ${roleLabels[item.currentRole]} et relancer si nécessaire.`
  }
  if (item.currentRole === user.role) {
    return item.id.startsWith('STOCK-')
      ? 'Traiter la passation de commande et répondre à la DG.'
      : 'Faire le travail du service puis valider l’étape.'
  }
  if (hasPendingAnswer(item, user)) return 'Répondre à la demande reçue.'
  return `Dossier actuellement chez ${roleLabels[item.currentRole]}.`
}

function getPriorityScore(item: WorkflowCase) {
  const amount = Number(String(item.amount).replace(/[^\d]/g, '')) || 0
  const priorityBase = item.priority === 'Urgent' ? 42 : item.priority === 'Haute' ? 28 : 14
  const statusBoost = item.status === 'Bloqué' ? 25 : item.status === 'Terminé' ? -20 : 8
  const stockBoost = item.id.startsWith('DOS-STK') ? 14 : 0
  const alertBoost = Math.min(16, item.alerts.length * 4)
  const dueBoost = item.due.includes('Aujourd') ? 10 : item.due.includes('Demain') ? 5 : 0
  const amountBoost = Math.min(12, Math.floor(amount / 50000) * 3)
  return Math.max(0, Math.min(100, priorityBase + statusBoost + stockBoost + alertBoost + dueBoost + amountBoost))
}

function getSlaInfo(item: WorkflowCase) {
  const hours = departmentSlaHours[item.currentRole]
  const score = getPriorityScore(item)
  const relances = item.alerts.filter((alert) => alert.to === item.currentRole && !alert.response).length
  if (item.status === 'Terminé') return { label: 'Clôturé', tone: 'success' as StatusTone, detail: 'Historique verrouillé' }
  if (item.status === 'Bloqué' || score >= 82 || relances >= 3) return { label: 'Hors SLA', tone: 'danger' as StatusTone, detail: `Escalade DG requise - SLA ${hours}h` }
  if (score >= 64 || relances >= 2) return { label: 'À surveiller', tone: 'warning' as StatusTone, detail: `Relance avant dépassement - SLA ${hours}h` }
  return { label: `SLA ${hours}h`, tone: 'info' as StatusTone, detail: `Service attendu: ${roleLabels[item.currentRole]}` }
}

function getVisibleCases(cases: WorkflowCase[], user: UserAccount) {
  if (user.role === 'dg') return cases
  return cases.filter((item) => {
    const ownsCurrentStep = item.currentRole === user.role
    const alreadyWorked = item.steps.some((step) => step.role === user.role && step.status === 'done')
    const hasConversation = item.alerts.some((alert) => alert.to === user.role || alert.from === user.role)
    return ownsCurrentStep || alreadyWorked || hasConversation
  })
}

function countNotifications(cases: WorkflowCase[], user: UserAccount) {
  if (user.role === 'dg') {
    return cases.reduce((total, item) => total + item.alerts.filter((alert) => alert.to === 'dg' || alert.response).length, 0)
  }
  return cases.reduce((total, item) => total + item.alerts.filter((alert) => alert.to === user.role && !alert.response).length, 0)
}

export default App
