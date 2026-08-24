import {
  Activity,
  Archive,
  Banknote,
  Bell,
  Boxes,
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
  ShieldCheck,
  Siren,
  TrendingDown,
  TrendingUp,
  UserCog,
  Users,
  WalletCards,
  Workflow,
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
  priorityDecision?: 'accepted' | 'forced'
  kind?: 'dg-alert' | 'reply' | 'department-message' | 'stock-auto'
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

const departmentLiaisons: Array<{ from: Role; to: Role; trigger: string; action: string }> = [
  { from: 'dg', to: 'appro', trigger: 'Stock inférieur au seuil', action: 'Valider la passation de commande et suivre la réponse Appro.' },
  { from: 'appro', to: 'finance', trigger: 'Commande fournisseur à engager', action: 'Confirmer budget, disponibilité paiement et priorité fournisseur.' },
  { from: 'finance', to: 'compta', trigger: 'Paiement ou financement validé', action: 'Contrôler facture, pièces justificatives et statut FNR.' },
  { from: 'compta', to: 'commercial', trigger: 'Impact client ou recouvrement', action: 'Informer le commercial sur blocage, relance ou disponibilité.' },
  { from: 'commercial', to: 'dg', trigger: 'Risque client ou arbitrage', action: 'Remonter décision, urgence ou conflit de priorité à la Direction.' },
]

const roleCapabilities: Record<Role, string> = {
  dg: 'Supervision globale, décisions, alertes et arbitrage des priorités.',
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

const quickMessageTemplates: Record<Role, string[]> = {
  dg: [
    'Décision DG: merci de traiter ce dossier maintenant et de confirmer un délai.',
    'Décision DG: priorité obligatoire, aucun report sans validation direction.',
    'Décision DG: délai accepté, merci de clôturer avec justificatif.',
  ],
  finance: [
    'Budget confirmé, le dossier peut continuer.',
    'Budget insuffisant, décision DG nécessaire.',
    'Paiement possible après contrôle des pièces.',
  ],
  compta: [
    'Pièce manquante, merci de compléter le dossier.',
    'Facture contrôlée, dossier conforme.',
    'FNR bloquée, arbitrage DG demandé.',
  ],
  appro: [
    'Commande lancée auprès du fournisseur.',
    'Fournisseur à confirmer avant commande.',
    'Stock critique, passation urgente en cours.',
  ],
  commercial: [
    'Client informé, retour attendu aujourd’hui.',
    'Risque client détecté, décision DG demandée.',
    'Impact vente confirmé, dossier prioritaire.',
  ],
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
          {active === 'dashboard' && <Dashboard filters={filters} onFiltersChange={setFilters} onAction={setMessage} user={sessionUser} workflowCases={workflowCases} stocks={stocks} onOpenDepartment={openDepartmentService} onOpenApproWorkflow={openApproWorkflow} />}
          {active === 'fnr' && <FNR filters={filters} onFiltersChange={setFilters} onAction={setMessage} />}
          {active === 'encaissements' && <Cashflow type="encaissements" filters={filters} onFiltersChange={setFilters} onAction={setMessage} />}
          {active === 'decaissements' && <Cashflow type="decaissements" filters={filters} onFiltersChange={setFilters} onAction={setMessage} />}
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
        <div className="login-ambient" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="login-brand">
          <img src="/tbtrade-logo.svg" alt="TBTrade" />
          <span>Command Center</span>
          <LockKeyhole size={15} />
        </div>
        <div className="login-hero-copy">
          <span className="login-kicker">Pilotage DG & opérations</span>
          <strong>Une entrée claire pour chaque service.</strong>
          <small>Alertes stock, dossiers fournisseurs, tâches et validations restent synchronisés entre la direction et les équipes.</small>
        </div>
        <div className="login-command-board" aria-label="Vue opérationnelle">
          <div className="command-board-header">
            <span>Flux actif</span>
            <strong>DG → Services</strong>
          </div>
          <div className="command-flow">
            <article>
              <span><ShieldCheck size={16} /></span>
              <strong>DG</strong>
              <small>Priorise</small>
            </article>
            <article>
              <span><Boxes size={16} /></span>
              <strong>Appro</strong>
              <small>Commande</small>
            </article>
            <article>
              <span><Workflow size={16} /></span>
              <strong>Dossiers</strong>
              <small>Suivi</small>
            </article>
          </div>
          <div className="command-status">
            <span><Activity size={15} /> Seuil stock contrôlé</span>
            <span><Bell size={15} /> Notification automatique</span>
            <span><PackageSearch size={15} /> Passation à traiter</span>
          </div>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-panel-card">
          <div className="login-panel-heading">
            <span className="eyebrow">Connexion sécurisée</span>
            <h1>Accès TB Trade</h1>
            <p>Choisissez une session de démonstration pour entrer dans l’espace adapté à votre rôle.</p>
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
  filters,
  onFiltersChange,
  onAction,
  user,
  workflowCases,
  stocks,
  onOpenDepartment,
  onOpenApproWorkflow,
}: {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onAction: (message: string) => void
  user: UserAccount
  workflowCases: WorkflowCase[]
  stocks: StockRow[]
  onOpenDepartment: (role: Role) => void
  onOpenApproWorkflow: () => void
}) {
  const visibleCases = getVisibleCases(workflowCases, user)
  const stockAlerts = stocks.filter(isStockUnderThreshold)
  const blockedCases = user.role === 'dg'
    ? workflowCases.filter((item) => item.status === 'Bloqué')
    : visibleCases.filter((item) => item.currentRole === user.role)
  const completedByRole = workflowCases.filter((item) => item.steps.some((step) => step.role === user.role && step.status === 'done')).length
  const pendingForRole = user.role === 'dg'
    ? workflowCases.filter((item) => item.status !== 'Terminé').length
    : workflowCases.filter((item) => item.currentRole === user.role && item.status !== 'Terminé').length

  return (
    <>
      <RoleSummary user={user} />
      <WorkflowControlCenter cases={workflowCases} user={user} />
      {user.role === 'dg' && <DepartmentWorkflowMap cases={workflowCases} onOpenDepartment={onOpenDepartment} />}
      {user.role === 'dg' && (
        <StockCommandCenter
          stocks={stocks}
          cases={workflowCases}
          onOpenApproWorkflow={onOpenApproWorkflow}
          onAction={onAction}
        />
      )}
      <WorkflowSnapshot cases={visibleCases} blockedCases={blockedCases} user={user} onAction={onAction} />
      <Filters compact filters={filters} onChange={onFiltersChange} onAction={onAction} />
      <MetricGrid
        metrics={[
          { label: "Chiffre d'affaires", value: '2 450 000 TND', trend: '+12.5% vs Avr 2024', icon: ChartColumnBig, color: 'blue' },
          { label: 'Encaissements', value: '1 320 000 TND', trend: '+8.3% vs Avr 2024', icon: WalletCards, color: 'green' },
          { label: 'Décaissements', value: '950 000 TND', trend: '-4.7% vs Avr 2024', icon: TrendingDown, color: 'red' },
          { label: 'Trésorerie disponible', value: '1 750 000 TND', trend: '+15.2% vs Avr 2024', icon: Banknote, color: 'green' },
          { label: 'FNR', value: '1 890 000 TND', trend: '+5.1% vs Avr 2024', icon: ReceiptText, color: 'orange' },
        ]}
      />
      <div className="grid two-one">
        <Panel title="Évolution du chiffre d'affaires">
          <LineChart />
        </Panel>
        <Panel title="Répartition CA par société">
          <Donut />
        </Panel>
        <Panel title="Top 5 des FNR par montant">
          <TopSuppliers onAction={onAction} />
        </Panel>
      </div>
      <MetricGrid
        metrics={[
          { label: 'Factures échues (+30 jours)', value: '56', trend: 'Action rapide', icon: FileText, color: 'red' },
          { label: 'Factures à échéance (7 jours)', value: '34', trend: 'Action rapide', icon: CalendarDays, color: 'orange' },
          { label: 'Alertes stock', value: String(stockAlerts.length), trend: stockAlerts.length > 0 ? 'Appro notifié auto' : 'Seuils maîtrisés', icon: PackageSearch, color: stockAlerts.length > 0 ? 'orange' : 'green' },
          { label: user.role === 'dg' ? 'Dossiers actifs' : 'Mes tâches à traiter', value: String(pendingForRole), trend: 'Workflow département', icon: ClipboardList, color: pendingForRole > 0 ? 'red' : 'green' },
          { label: user.role === 'dg' ? 'Étapes finalisées' : 'Mes travaux validés', value: String(completedByRole), trend: 'Traçabilité workflow', icon: ClipboardCheck, color: 'green' },
        ]}
      />
    </>
  )
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
}: {
  type: 'encaissements' | 'decaissements'
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onAction: (message: string) => void
}) {
  const isIncome = type === 'encaissements'
  const sourceRows: Array<Record<string, ReactNode>> = isIncome ? encaissements : decaissements
  const rows = useFilteredRows(sourceRows, filters)

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
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)
  const [reply, setReply] = useState('Je vais le faire, sinon je propose un traitement dès que je suis disponible.')
  const [promisedAt, setPromisedAt] = useState('Aujourd’hui 14:30')
  const [departmentMessage, setDepartmentMessage] = useState('Merci de me confirmer les pièces manquantes pour avancer sur ce paiement.')
  const [departmentRecipient, setDepartmentRecipient] = useState<Role>('dg')
  const [dgMessage, setDgMessage] = useState('Merci de traiter ce dossier en priorité et de répondre avec un engagement horaire.')
  const [dgRecipient, setDgRecipient] = useState<Role>('finance')
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
    const filtered = departmentScoped.filter((item) => item.status === activeTab)
    return selectedCaseId ? [...filtered].sort((a, b) => Number(b.id === selectedCaseId) - Number(a.id === selectedCaseId)) : filtered
  }, [activeTab, departmentFocus, selectedCaseId, user, workflowCases])

  const tabs = ['Tous', 'À traiter', 'Urgent', 'Sans réponse', 'En cours', 'Bloqué', 'Terminé']
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

  const sendDepartmentMessage = (caseId: string) => {
    const updated = workflowCases.map((item) => {
      if (item.id !== caseId) return item
      return {
        ...item,
        alerts: [
          ...item.alerts,
          {
            id: Date.now(),
            from: user.role,
            to: departmentRecipient,
            sentAt: 'Maintenant',
            message: departmentMessage,
            kind: 'department-message' as const,
          },
        ],
      }
    })
    setWorkflowCases(updated)
    onAction('Message de coordination envoyé dans le dossier.')
  }

  const forcePriority = (caseId: string) => {
    const updated = workflowCases.map((item) => item.id === caseId
      ? {
          ...item,
          priority: 'Urgent' as const,
          alerts: [
            ...item.alerts.map((alert, index) => index === item.alerts.length - 1 ? { ...alert, priorityDecision: 'forced' as const } : alert),
            {
              id: Date.now(),
              from: 'dg' as const,
              to: item.currentRole,
              sentAt: 'Maintenant',
              message: `Décision DG: dossier ${item.id} obligatoire en priorité avant tous les autres.`,
              priorityDecision: 'forced' as const,
              kind: 'dg-alert' as const,
            },
          ],
        }
      : item)
    setWorkflowCases(updated)
    onAction('Décision DG enregistrée: dossier obligatoire en priorité avant les autres.')
  }

  const acceptDelay = (caseId: string) => {
    const updated = workflowCases.map((item) => item.id === caseId
      ? {
          ...item,
          alerts: [
            ...item.alerts.map((alert, index) => index === item.alerts.length - 1 ? { ...alert, priorityDecision: 'accepted' as const } : alert),
            {
              id: Date.now(),
              from: 'dg' as const,
              to: item.currentRole,
              sentAt: 'Maintenant',
              message: `Décision DG: délai proposé accepté pour ${item.id}.`,
              priorityDecision: 'accepted' as const,
              kind: 'dg-alert' as const,
            },
          ],
        }
      : item)
    setWorkflowCases(updated)
    onAction('Délai proposé accepté par la Direction Générale.')
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

  const sendDgMessage = (caseId: string) => {
    const updated = workflowCases.map((item) => item.id === caseId
      ? {
          ...item,
          alerts: [
            ...item.alerts,
            {
              id: Date.now(),
              from: 'dg' as const,
              to: dgRecipient,
              sentAt: 'Maintenant',
              message: dgMessage,
              kind: 'dg-alert' as const,
            },
          ],
        }
      : item)
    setWorkflowCases(updated)
    onAction(`Message DG envoyé à ${roleLabels[dgRecipient]} pour ${caseId}.`)
  }

  return (
    <>
      <NotificationCenter
        items={inboxItems}
        user={user}
        onAction={onAction}
        onOpenCase={(caseId) => {
          setActiveTab('Tous')
          onDepartmentFocusChange('all')
          setSelectedCaseId(caseId)
          onAction(`Dossier ${caseId} sélectionné dans la boîte de notifications.`)
        }}
      />
      <WorkflowEasePanel cases={workflowCases} user={user} />
      <WorkflowActionHub
        cases={workflowCases}
        user={user}
        onOpenCase={(caseId) => {
          setActiveTab('Tous')
          onDepartmentFocusChange('all')
          setSelectedCaseId(caseId)
          onAction(`Action ouverte: ${caseId}.`)
        }}
      />
      <DepartmentLiaisonPanel
        cases={workflowCases}
        user={user}
        onFocus={(role) => {
          onDepartmentFocusChange(role)
          setActiveTab('Tous')
          setSelectedCaseId(null)
          onAction(`Liaison ouverte vers ${roleLabels[role]}.`)
        }}
      />
      {user.role === 'dg' && (
        <section className="service-switcher" aria-label="Filtre département DG">
          <div>
            <span className="eyebrow">Vue service</span>
            <strong>{departmentFocus === 'all' ? 'Tous les départements' : roleLabels[departmentFocus]}</strong>
          </div>
          <div className="service-buttons">
            <button
              className={departmentFocus === 'all' ? 'active' : ''}
              type="button"
              onClick={() => {
                onDepartmentFocusChange('all')
                setSelectedCaseId(null)
                onAction('Vue DG complète: tous les départements affichés.')
              }}
            >
              Tous services
            </button>
            {workflowRoles.map((role) => {
              const count = workflowCases.filter((item) => item.currentRole === role && item.status !== 'Terminé').length
              return (
                <button
                  className={departmentFocus === role ? 'active' : ''}
                  key={role}
                  type="button"
                  onClick={() => {
                    onDepartmentFocusChange(role)
                    setSelectedCaseId(null)
                    setActiveTab('Tous')
                    onAction(`Vue DG filtrée sur ${roleLabels[role]}: ${count} dossier(s) en charge.`)
                  }}
                >
                  {roleLabels[role]}
                  <span>{count}</span>
                </button>
              )
            })}
          </div>
        </section>
      )}
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            className={activeTab === tab ? 'active' : ''}
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab)
              onAction(`Tâches filtrées: ${tab}.`)
            }}
          >
            {tab}
          </button>
        ))}
      </div>
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
      <div className="workflow-board">
        {visibleCases.map((item) => (
          <WorkflowCaseCard
            item={item}
            key={item.id}
            user={user}
            reply={reply}
            promisedAt={promisedAt}
            onReplyChange={setReply}
            onPromisedAtChange={setPromisedAt}
            dgMessage={dgMessage}
            dgRecipient={dgRecipient}
            onDgMessageChange={setDgMessage}
            onDgRecipientChange={setDgRecipient}
            onAlert={() => alertCase(item.id)}
            onDgMessage={() => sendDgMessage(item.id)}
            onReply={() => replyToDg(item.id)}
            departmentMessage={departmentMessage}
            departmentRecipient={departmentRecipient}
            onDepartmentMessageChange={setDepartmentMessage}
            onDepartmentRecipientChange={setDepartmentRecipient}
            onSendDepartmentMessage={() => sendDepartmentMessage(item.id)}
            onComplete={() => completeStep(item.id)}
            onForcePriority={() => forcePriority(item.id)}
            onAcceptDelay={() => acceptDelay(item.id)}
            selected={item.id === selectedCaseId}
          />
        ))}
        {visibleCases.length === 0 && <Panel title="Aucun dossier"><p className="muted">Aucune tâche ne correspond à ce filtre.</p></Panel>}
      </div>
    </>
  )
}

function WorkflowEasePanel({ cases, user }: { cases: WorkflowCase[]; user: UserAccount }) {
  const scopedCases = getVisibleCases(cases, user).filter((item) => item.status !== 'Terminé')
  const rankedCases = [...scopedCases].sort((a, b) => getPriorityScore(b) - getPriorityScore(a))
  const topCase = rankedCases[0]
  const slaDanger = scopedCases.filter((item) => getSlaInfo(item).tone === 'danger')
  const pending = scopedCases.filter((item) => user.role === 'dg' ? hasPendingAnswer(item, user) : item.currentRole === user.role)

  return (
    <section className="workflow-ease">
      <div className="ease-main">
        <span className="eyebrow">Flux simplifié</span>
        <h2>{topCase ? getNextActionLabel(topCase, user) : 'Aucune action urgente pour cette session.'}</h2>
        {topCase && <p>{topCase.id} - score priorité {getPriorityScore(topCase)}/100 - {getSlaInfo(topCase).detail}</p>}
      </div>
      <div className="ease-kpis">
        <article>
          <Gauge size={17} />
          <span>Priorité max</span>
          <strong>{topCase ? `${getPriorityScore(topCase)}/100` : '0/100'}</strong>
        </article>
        <article>
          <Siren size={17} />
          <span>SLA dépassé</span>
          <strong>{slaDanger.length}</strong>
        </article>
        <article>
          <ClipboardCheck size={17} />
          <span>À traiter</span>
          <strong>{pending.length}</strong>
        </article>
      </div>
    </section>
  )
}

function WorkflowActionHub({
  cases,
  user,
  onOpenCase,
}: {
  cases: WorkflowCase[]
  user: UserAccount
  onOpenCase: (caseId: string) => void
}) {
  const scopedCases = getVisibleCases(cases, user).filter((item) => item.status !== 'Terminé')
  const actionCases = scopedCases
    .filter((item) => user.role === 'dg' ? item.status === 'Bloqué' || hasPendingAnswer(item, user) : item.currentRole === user.role || hasPendingAnswer(item, user))
    .slice(0, 4)

  return (
    <section className="action-hub">
      <div className="action-hub-title">
        <div>
          <span className="eyebrow">À faire maintenant</span>
          <h2>{user.role === 'dg' ? 'Décisions et relances DG' : `Actions ${roleLabels[user.role]}`}</h2>
        </div>
        <Status value={`${actionCases.length} action(s)`} />
      </div>
      <div className="action-hub-grid">
        {actionCases.length === 0 && <p className="muted">Aucune action immédiate. Les dossiers restent visibles dans la liste complète.</p>}
        {actionCases.map((item) => (
          <article key={`action-${item.id}`}>
            <span className="action-icon">
              {item.status === 'Bloqué' ? <Siren size={17} /> : <ClipboardCheck size={17} />}
            </span>
            <div>
              <strong>{getNextActionLabel(item, user)}</strong>
              <small>{item.id} - {item.title}</small>
            </div>
            <button className="primary-action" type="button" onClick={() => onOpenCase(item.id)}>
              Traiter
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

function DepartmentLiaisonPanel({
  cases,
  user,
  onFocus,
}: {
  cases: WorkflowCase[]
  user: UserAccount
  onFocus: (role: Role) => void
}) {
  const visibleLiaisons = departmentLiaisons.filter((liaison) => user.role === 'dg' || liaison.from === user.role || liaison.to === user.role)

  return (
    <section className="liaison-panel">
      <div className="liaison-header">
        <div>
          <span className="eyebrow">Liaisons nécessaires</span>
          <h2>Coordination entre départements</h2>
        </div>
        <Status value="Flux connecté" />
      </div>
      <div className="liaison-grid">
        {visibleLiaisons.map((liaison) => {
          const activeCount = cases.filter((item) => item.status !== 'Terminé' && (item.currentRole === liaison.from || item.currentRole === liaison.to)).length
          const hasMessages = cases.some((item) => item.alerts.some((alert) => alert.from === liaison.from && alert.to === liaison.to))
          return (
            <article key={`${liaison.from}-${liaison.to}`}>
              <div className="liaison-route">
                <strong>{roleLabels[liaison.from]}</strong>
                <ChevronRight size={15} />
                <strong>{roleLabels[liaison.to]}</strong>
              </div>
              <span>{liaison.trigger}</span>
              <p>{liaison.action}</p>
              <div className="liaison-footer">
                <Status value={hasMessages ? 'Déjà utilisé' : 'À activer si besoin'} />
                <small>{activeCount} dossier(s) liés</small>
                <button className="secondary-action" type="button" onClick={() => onFocus(liaison.to === 'dg' ? liaison.from : liaison.to)}>
                  Voir
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function WorkflowControlCenter({ cases, user }: { cases: WorkflowCase[]; user: UserAccount }) {
  const scopedCases = getVisibleCases(cases, user)
  const blocked = scopedCases.filter((item) => item.status === 'Bloqué')
  const urgent = scopedCases.filter((item) => item.priority === 'Urgent')
  const pendingReplies = user.role === 'dg'
    ? cases.filter((item) => item.alerts.some((alert) => alert.to === 'dg' || alert.response))
    : scopedCases.filter((item) => item.alerts.some((alert) => alert.to === user.role && !alert.response))
  const completed = scopedCases.filter((item) => item.status === 'Terminé')
  const departmentLoad = workflowRoles.map((role) => ({
    role,
    total: cases.filter((item) => item.currentRole === role && item.status !== 'Terminé').length,
    blocked: cases.filter((item) => item.currentRole === role && item.status === 'Bloqué').length,
  }))

  return (
    <section className="control-center">
      <div className="control-header">
        <div>
          <span className="eyebrow">{user.role === 'dg' ? 'Pilotage DG' : 'Mon poste de travail'}</span>
          <h2>{user.role === 'dg' ? 'Processus complet par département' : 'Priorités de ma session'}</h2>
        </div>
        <Status value={blocked.length > 0 ? `${blocked.length} blocage(s)` : 'Flux normal'} />
      </div>
      <div className="control-kpis">
        <article>
          <Workflow size={18} />
          <span>Dossiers visibles</span>
          <strong>{scopedCases.length}</strong>
        </article>
        <article>
          <Siren size={18} />
          <span>Urgences</span>
          <strong>{urgent.length}</strong>
        </article>
        <article>
          <MessageSquareText size={18} />
          <span>Réponses / notifs</span>
          <strong>{pendingReplies.length}</strong>
        </article>
        <article>
          <CheckCircle2 size={18} />
          <span>Terminés</span>
          <strong>{completed.length}</strong>
        </article>
      </div>
      {user.role === 'dg' && (
        <div className="department-load">
          {departmentLoad.map((item) => (
            <span key={item.role}>
              <strong>{roleLabels[item.role]}</strong>
              {item.total} en cours
              {item.blocked > 0 && <b>{item.blocked} bloqué</b>}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}

function DepartmentWorkflowMap({ cases, onOpenDepartment }: { cases: WorkflowCase[]; onOpenDepartment: (role: Role) => void }) {
  return (
    <section className="department-map">
      <div className="map-header">
        <div>
          <span className="eyebrow">Workflow DG</span>
          <h2>Finance → Comptabilité → Commercial → Approvisionnement</h2>
        </div>
        <Status value="Supervision active" />
      </div>
      <div className="map-lanes">
        {workflowRoles.map((role, index) => {
          const activeCases = cases.filter((item) => item.currentRole === role && item.status !== 'Terminé')
          const blockedCases = activeCases.filter((item) => item.status === 'Bloqué')
          const lastCase = activeCases[0]
          return (
            <article className={blockedCases.length > 0 ? 'blocked' : ''} key={role}>
              <div className="lane-index">{index + 1}</div>
              <strong>{roleLabels[role]}</strong>
              <span>{activeCases.length} dossier(s) en charge</span>
              <small>{lastCase ? `${lastCase.id} - ${lastCase.title}` : 'Aucun dossier en attente'}</small>
              <div className="lane-bar">
                <i style={{ width: `${Math.min(100, activeCases.length * 35 + blockedCases.length * 20)}%` }} />
              </div>
              <button className="secondary-action" type="button" onClick={() => onOpenDepartment(role)}>
                Voir service
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function NotificationCenter({
  items,
  user,
  onAction,
  onOpenCase,
}: {
  items: Array<{ case: WorkflowCase; alert: WorkflowAlert }>
  user: UserAccount
  onAction: (message: string) => void
  onOpenCase: (caseId: string) => void
}) {
  const latest = [...items].reverse().slice(0, 5)

  return (
    <Panel title={user.role === 'dg' ? 'Boîte DG - retours départements' : 'Mes notifications de travail'}>
      <div className="inbox-list">
        {latest.length === 0 && <p className="muted">Aucune notification pour cette session.</p>}
        {latest.map(({ case: item, alert }) => (
          <article key={`${item.id}-${alert.id}`}>
            <div className="inbox-icon">
              {alert.kind === 'reply' ? <MessageSquareText size={17} /> : <Bell size={17} />}
            </div>
            <div>
              <span className="eyebrow">{item.id} - {roleLabels[alert.from]} vers {roleLabels[alert.to]}</span>
              <strong>{item.title}</strong>
              <p>{alert.response ?? alert.message}</p>
              <Status value={getNotificationType(alert)} />
              {alert.promisedAt && <small>Engagement proposé: {alert.promisedAt}</small>}
            </div>
            <button className="secondary-action" type="button" onClick={() => {
              onOpenCase(item.id)
              onAction(`Notification ouverte: ${item.id}.`)
            }}>
              Ouvrir
            </button>
          </article>
        ))}
      </div>
    </Panel>
  )
}

function WorkflowSnapshot({
  cases,
  blockedCases,
  user,
  onAction,
}: {
  cases: WorkflowCase[]
  blockedCases: WorkflowCase[]
  user: UserAccount
  onAction: (message: string) => void
}) {
  const activeLabel = user.role === 'dg' ? 'Dossiers supervisés' : 'Mes dossiers actifs'
  return (
    <div className="grid half">
      <Panel title={activeLabel}>
        <div className="workflow-mini-list">
          {cases.slice(0, 3).map((item) => (
            <button key={item.id} type="button" onClick={() => onAction(`Ouverture workflow ${item.id}.`)}>
              <Workflow size={16} />
              <span>
                <strong>{item.title}</strong>
                <small>{item.id} - étape: {roleLabels[item.currentRole]}</small>
              </span>
              <Status value={item.status} />
            </button>
          ))}
        </div>
      </Panel>
      <Panel title={user.role === 'dg' ? 'Blocages à décider' : 'Notifications DG'}>
        <div className="notification-list">
          {blockedCases.length === 0 && <p className="muted">Aucun blocage critique pour cette session.</p>}
          {blockedCases.map((item) => (
            <article key={item.id}>
              <ShieldAlert size={16} />
              <span>
                <strong>{item.title}</strong>
                <small>{user.role === 'dg' ? `${roleLabels[item.currentRole]} bloque le dossier.` : 'La DG attend votre retour.'}</small>
              </span>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function QuickTemplateBar({ templates, onPick }: { templates: string[]; onPick: (template: string) => void }) {
  return (
    <div className="quick-template-bar">
      {templates.map((template) => (
        <button key={template} type="button" onClick={() => onPick(template)}>
          {template}
        </button>
      ))}
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

function WorkflowCaseCard({
  item,
  user,
  reply,
  promisedAt,
  onReplyChange,
  onPromisedAtChange,
  dgMessage,
  dgRecipient,
  onDgMessageChange,
  onDgRecipientChange,
  onAlert,
  onDgMessage,
  onReply,
  departmentMessage,
  departmentRecipient,
  onDepartmentMessageChange,
  onDepartmentRecipientChange,
  onSendDepartmentMessage,
  onComplete,
  onForcePriority,
  onAcceptDelay,
  selected,
}: {
  item: WorkflowCase
  user: UserAccount
  reply: string
  promisedAt: string
  onReplyChange: (value: string) => void
  onPromisedAtChange: (value: string) => void
  dgMessage: string
  dgRecipient: Role
  onDgMessageChange: (value: string) => void
  onDgRecipientChange: (value: Role) => void
  onAlert: () => void
  onDgMessage: () => void
  onReply: () => void
  departmentMessage: string
  departmentRecipient: Role
  onDepartmentMessageChange: (value: string) => void
  onDepartmentRecipientChange: (value: Role) => void
  onSendDepartmentMessage: () => void
  onComplete: () => void
  onForcePriority: () => void
  onAcceptDelay: () => void
  selected: boolean
}) {
  const pendingAlert = item.alerts.findLast((alert) => alert.to === user.role && !alert.response)
  const lastReply = item.alerts.findLast((alert) => alert.response || alert.from !== 'dg')
  const isCurrentOwner = item.currentRole === user.role && item.status !== 'Terminé'
  const isDg = user.role === 'dg'
  const isClosed = item.status === 'Terminé'
  const priorityScore = getPriorityScore(item)
  const slaInfo = getSlaInfo(item)
  const stockRecommendation = item.id.startsWith('DOS-STK')
    ? {
        quantity: item.amount,
        supplier: item.supplier,
      }
    : null

  return (
    <article className={`workflow-card ${selected ? 'selected' : ''}`}>
      <header>
        <div>
          <span className="eyebrow">{item.id}</span>
          <h2>{item.title}</h2>
          <p>{item.supplier} - {item.amount} - échéance {item.due}</p>
        </div>
        <div className="workflow-status">
          <Status value={item.priority} />
          <Status value={item.status} />
          <Status value={slaInfo.label} />
        </div>
      </header>

      <div className="decision-summary">
        <article>
          <span>Score priorité</span>
          <strong>{priorityScore}/100</strong>
        </article>
        <article>
          <span>SLA</span>
          <strong>{slaInfo.detail}</strong>
        </article>
        <article>
          <span>Escalade</span>
          <strong>{getEscalationLabel(item)}</strong>
        </article>
      </div>

      <div className="next-action-strip">
        <span><Gauge size={15} /> Prochaine action</span>
        <strong>{getNextActionLabel(item, user)}</strong>
        <small>{isDg ? `Service attendu: ${roleLabels[item.currentRole]}` : isCurrentOwner ? 'Votre service doit agir maintenant' : `En attente de ${roleLabels[item.currentRole]}`}</small>
      </div>

      {stockRecommendation && (
        <div className="stock-order-note">
          <PackageSearch size={16} />
          <span>
            <strong>Commande suggérée</strong>
            {stockRecommendation.quantity} - fournisseur: {stockRecommendation.supplier}
          </span>
        </div>
      )}

      <div className="liaison-chain" aria-label="Liaisons du dossier">
        {item.steps.map((step, index) => (
          <span className={step.status} key={`liaison-${item.id}-${step.role}`}>
            {roleLabels[step.role]}
            {index < item.steps.length - 1 && <ChevronRight size={13} />}
          </span>
        ))}
      </div>

      <div className="workflow-steps" aria-label="Workflow visuel">
        {item.steps.map((step) => (
          <div className={`workflow-step ${step.status}`} key={`${item.id}-${step.role}`}>
            <span>{roleLabels[step.role]}</span>
            <strong>{step.label}</strong>
            <small>{step.note}</small>
          </div>
        ))}
      </div>

      <div className="workflow-meta">
        <span><Users size={15} /> Responsable actuel: {roleLabels[item.currentRole]} ({item.owner})</span>
        <span><Bell size={15} /> Alertes: {item.alerts.length}</span>
      </div>

      <ApiExchangeTimeline item={item} user={user} />

      {item.alerts.length > 0 && (
        <div className="message-thread">
          {item.alerts.map((alert) => (
            <article key={alert.id}>
              <MessageSquareText size={15} />
              <div>
                <strong>{roleLabels[alert.from]} vers {roleLabels[alert.to]} - {alert.sentAt}</strong>
                <p>{alert.message}</p>
                {alert.response && <small>Réponse: {alert.response} Traitement proposé: {alert.promisedAt}</small>}
                {alert.priorityDecision === 'accepted' && <Status value="Délai accepté" />}
                {alert.priorityDecision === 'forced' && <Status value="Priorité obligatoire" />}
              </div>
            </article>
          ))}
        </div>
      )}

      {isClosed && (
        <div className="locked-history">
          <LockKeyhole size={16} />
          <span>
            <strong>Dossier clôturé</strong>
            Historique conservé, aucune action restante.
          </span>
        </div>
      )}

      {isDg && !isClosed && (
        <div className="dg-action-box">
          <div className="workflow-actions">
            <button className="primary-action" type="button" onClick={onAlert}>
              <Bell size={15} />
              Alerter {roleLabels[item.currentRole]} - 3h
            </button>
            {lastReply?.promisedAt && <button className="secondary-action" type="button" onClick={onAcceptDelay}>Accepter le délai</button>}
            {lastReply?.promisedAt && <button className="secondary-action danger" type="button" onClick={onForcePriority}>Priorité obligatoire</button>}
          </div>
          <QuickTemplateBar
            templates={quickMessageTemplates.dg}
            onPick={(template) => {
              onDgRecipientChange(item.currentRole)
              onDgMessageChange(template)
            }}
          />
          <div className="message-composer">
            <label>
              Département à notifier
              <select value={dgRecipient} onChange={(event) => onDgRecipientChange(event.target.value as Role)}>
                {workflowRoles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
              </select>
            </label>
            <label>
              Message DG
              <input value={dgMessage} onChange={(event) => onDgMessageChange(event.target.value)} />
            </label>
            <button className="secondary-action" type="button" onClick={onDgMessage}>
              <Send size={15} />
              Envoyer message
            </button>
          </div>
        </div>
      )}

      {!isDg && !isClosed && (
        <div className="department-reply">
          {pendingAlert && <p className="muted">Notification DG reçue: {pendingAlert.message}</p>}
          <QuickTemplateBar
            templates={quickMessageTemplates[user.role]}
            onPick={(template) => {
              onReplyChange(template)
              onDepartmentMessageChange(template)
            }}
          />
          <label>
            Réponse à la DG
            <input value={reply} onChange={(event) => onReplyChange(event.target.value)} />
          </label>
          <label>
            Date/heure proposée
            <input value={promisedAt} onChange={(event) => onPromisedAtChange(event.target.value)} />
          </label>
          <div className="workflow-actions">
            <button className="secondary-action" type="button" onClick={onReply}>
              <Send size={15} />
              Répondre à la DG
            </button>
            {isCurrentOwner && <button className="primary-action" type="button" onClick={onComplete}>
              <ClipboardCheck size={15} />
              Travail fait
            </button>}
          </div>
          <label>
            Message interne dossier
            <input value={departmentMessage} onChange={(event) => onDepartmentMessageChange(event.target.value)} />
          </label>
          <label>
            Destinataire
            <select value={departmentRecipient} onChange={(event) => onDepartmentRecipientChange(event.target.value as Role)}>
              {[ 'dg', ...workflowRoles ].filter((role) => role !== user.role).map((role) => (
                <option key={role} value={role}>{roleLabels[role as Role]}</option>
              ))}
            </select>
          </label>
          <button className="secondary-action" type="button" onClick={onSendDepartmentMessage}>
            <MessageSquareText size={15} />
            Communiquer sur le dossier
          </button>
        </div>
      )}
    </article>
  )
}

function ApiExchangeTimeline({ item, user }: { item: WorkflowCase; user: UserAccount }) {
  const visibleAlerts = user.role === 'dg'
    ? item.alerts
    : item.alerts.filter((alert) => alert.to === user.role || alert.from === user.role)

  return (
    <div className="api-timeline" aria-label="Historique enregistré du dossier">
      {visibleAlerts.slice(-4).map((alert) => (
        <span key={`api-${item.id}-${alert.id}`}>
          <CheckCircle2 size={13} />
          Historique: {roleLabels[alert.from]} → {roleLabels[alert.to]}
        </span>
      ))}
      {visibleAlerts.length === 0 && (
        <span>
          <Workflow size={13} />
          En attente du premier échange enregistré
        </span>
      )}
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

function RoleSummary({ user }: { user: UserAccount }) {
  return (
    <section className="role-summary">
      <div>
        <span className="eyebrow">Session active</span>
        <h2>{roleLabels[user.role]}</h2>
        <p>{roleCapabilities[user.role]}</p>
      </div>
      <Status value="Actif" />
    </section>
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
    if (['En retard', 'Haute', 'Urgent', 'Bloqué', 'Rupture', 'PDF', 'Suspendu', 'Priorité obligatoire', 'Hors SLA', 'Critique', 'Action obligatoire', 'Blocage rouge DG', 'Escalade immédiate'].includes(text)) return 'danger'
    if (['À échéance', 'Moyenne', 'Faible stock', 'Délai accepté', 'À surveiller', 'Relance automatique'].includes(text)) return 'warning'
    if (['À venir', 'En cours', 'Excel', 'Direction Générale', 'Finance', 'Comptabilité', 'Approvisionnement', 'Commercial', 'Information', 'Réponse reçue'].includes(text) || text.startsWith('SLA ')) return 'info'
    return 'success'
  }, [text])

  return <span className={`status ${className}`}>{text}</span>
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

function Donut() {
  return (
    <div className="donut-wrap">
      <div className="donut" />
      <div className="legend">
        <span><i className="dot blue" />TBTrade <strong>60%</strong><small>1 470 000 TND</small></span>
        <span><i className="dot cyan" />TBRetail <strong>40%</strong><small>980 000 TND</small></span>
        <b>Total<br />2 450 000 TND</b>
      </div>
    </div>
  )
}

function TopSuppliers({ onAction }: { onAction: (message: string) => void }) {
  const suppliers = [
    ['Fournisseur A', 320000],
    ['Fournisseur B', 280000],
    ['Fournisseur C', 210000],
    ['Fournisseur D', 190000],
    ['Fournisseur E', 150000],
  ]

  return (
    <div className="supplier-list">
      {suppliers.map(([name, amount]) => (
        <div key={String(name)}>
          <span>{name}</span>
          <strong>{formatNumber(Number(amount))} TND</strong>
        </div>
      ))}
      <button className="link-btn" type="button" onClick={() => onAction('Ouverture de toutes les FNR fournisseurs.')}>Voir tout</button>
    </div>
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

function getEscalationLabel(item: WorkflowCase) {
  const sla = getSlaInfo(item)
  const relances = item.alerts.filter((alert) => alert.to === item.currentRole && !alert.response).length
  if (item.status === 'Terminé') return 'Aucune escalade'
  if (sla.tone === 'danger') return relances >= 3 ? 'Blocage rouge DG' : 'Escalade immédiate'
  if (sla.tone === 'warning') return 'Relance automatique'
  return 'Flux normal'
}

function getNotificationType(alert: WorkflowAlert) {
  if (alert.priorityDecision === 'forced' || alert.kind === 'stock-auto') return 'Critique'
  if (alert.kind === 'reply' || alert.response) return 'Réponse reçue'
  if (alert.kind === 'dg-alert') return 'Action obligatoire'
  return 'Information'
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
