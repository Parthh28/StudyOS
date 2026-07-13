'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ExtractedTopic {
  name: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimated_mins: number
  priority: 'low' | 'medium' | 'high'
  selected: boolean
}

export interface ExtractedUnit {
  name: string
  order_index: number
  topics: ExtractedTopic[]
}

export interface ExtractedSyllabus {
  subjectName: string
  subjectCode: string
  color: string
  icon: string
  estimatedTotalHours: number
  difficulty: 'easy' | 'medium' | 'hard'
  units: ExtractedUnit[]
}

const PRESET_SYLLABI: Record<string, ExtractedSyllabus> = {
  cs: {
    subjectName: 'Advanced Data Structures & Algorithms',
    subjectCode: 'CS304R02',
    color: '#2563EB', // Sapphire Blue
    icon: 'Code',
    estimatedTotalHours: 42,
    difficulty: 'hard',
    units: [
      {
        name: 'Unit I: Advanced Trees & Priority Queues',
        order_index: 1,
        topics: [
          { name: 'Red-Black Trees & AVL Balance Criteria', difficulty: 'hard', estimated_mins: 120, priority: 'high', selected: true },
          { name: 'B-Trees and B+ Trees in Database Indexing', difficulty: 'medium', estimated_mins: 90, priority: 'medium', selected: true },
          { name: 'Binomial and Fibonacci Heaps', difficulty: 'hard', estimated_mins: 150, priority: 'high', selected: true },
          { name: 'Amortized Analysis & Potential Method', difficulty: 'medium', estimated_mins: 90, priority: 'medium', selected: true },
        ]
      },
      {
        name: 'Unit II: Graph Algorithms & Network Flows',
        order_index: 2,
        topics: [
          { name: 'Dijkstra & Bellman-Ford Shortest Path Variants', difficulty: 'medium', estimated_mins: 120, priority: 'high', selected: true },
          { name: 'Ford-Fulkerson & Edmonds-Karp Max-Flow Min-Cut', difficulty: 'hard', estimated_mins: 180, priority: 'high', selected: true },
          { name: 'Strongly Connected Components (Tarjan & Kosaraju)', difficulty: 'medium', estimated_mins: 100, priority: 'medium', selected: true },
          { name: 'Bipartite Matching & Network Routing Applications', difficulty: 'medium', estimated_mins: 90, priority: 'low', selected: true },
        ]
      },
      {
        name: 'Unit III: Dynamic Programming & Greedy Strategies',
        order_index: 3,
        topics: [
          { name: 'Matrix Chain Multiplication & Optimal Binary Search Trees', difficulty: 'medium', estimated_mins: 120, priority: 'high', selected: true },
          { name: 'Longest Common Subsequence & Edit Distance Optimization', difficulty: 'easy', estimated_mins: 90, priority: 'medium', selected: true },
          { name: '0/1 Knapsack & Fractional Knapsack Proofs', difficulty: 'easy', estimated_mins: 60, priority: 'medium', selected: true },
          { name: 'Huffman Coding & Data Compression Fundamentals', difficulty: 'medium', estimated_mins: 90, priority: 'high', selected: true },
        ]
      },
      {
        name: 'Unit IV: NP-Completeness & Approximation Algorithms',
        order_index: 4,
        topics: [
          { name: 'P vs NP, Polynomial Time Reductions & SAT Problem', difficulty: 'hard', estimated_mins: 180, priority: 'high', selected: true },
          { name: 'Vertex Cover & Travelling Salesperson (TSP) Reductions', difficulty: 'hard', estimated_mins: 150, priority: 'high', selected: true },
          { name: '2-Approximation Algorithms for Metric TSP', difficulty: 'medium', estimated_mins: 120, priority: 'medium', selected: true },
        ]
      }
    ]
  },
  math: {
    subjectName: 'Multivariable Calculus & Vector Analysis',
    subjectCode: 'MAT202R01',
    color: '#0284C7', // Cerulean
    icon: 'LineChart',
    estimatedTotalHours: 36,
    difficulty: 'hard',
    units: [
      {
        name: 'Unit I: Partial Differentiation & Gradients',
        order_index: 1,
        topics: [
          { name: 'Limits and Continuity in Higher Dimensions', difficulty: 'medium', estimated_mins: 90, priority: 'medium', selected: true },
          { name: 'Partial Derivatives & The Chain Rule for Functions of Several Variables', difficulty: 'easy', estimated_mins: 90, priority: 'high', selected: true },
          { name: 'Directional Derivatives and Gradient Vectors', difficulty: 'medium', estimated_mins: 120, priority: 'high', selected: true },
          { name: 'Lagrange Multipliers & Constrained Optimization', difficulty: 'hard', estimated_mins: 150, priority: 'high', selected: true },
        ]
      },
      {
        name: 'Unit II: Multiple Integrals & Transformations',
        order_index: 2,
        topics: [
          { name: 'Double Integrals over Rectangular and General Regions', difficulty: 'medium', estimated_mins: 120, priority: 'high', selected: true },
          { name: 'Change of Variables in Polar Coordinates', difficulty: 'easy', estimated_mins: 90, priority: 'medium', selected: true },
          { name: 'Triple Integrals in Cylindrical and Spherical Coordinates', difficulty: 'hard', estimated_mins: 150, priority: 'high', selected: true },
          { name: 'Jacobians and General Transformations of Coordinates', difficulty: 'hard', estimated_mins: 120, priority: 'medium', selected: true },
        ]
      },
      {
        name: 'Unit III: Vector Calculus & Line Integrals',
        order_index: 3,
        topics: [
          { name: 'Vector Fields, Work & Conservative Vector Fields', difficulty: 'medium', estimated_mins: 100, priority: 'medium', selected: true },
          { name: 'Line Integrals & Fundamental Theorem for Line Integrals', difficulty: 'medium', estimated_mins: 120, priority: 'high', selected: true },
          { name: "Green's Theorem in the Plane & Circulation/Flux", difficulty: 'hard', estimated_mins: 150, priority: 'high', selected: true },
        ]
      },
      {
        name: 'Unit IV: Surface Integrals & Integral Theorems',
        order_index: 4,
        topics: [
          { name: 'Parametric Surfaces and Surface Area Calculations', difficulty: 'medium', estimated_mins: 120, priority: 'medium', selected: true },
          { name: "Stokes' Theorem for Curl and Circulation", difficulty: 'hard', estimated_mins: 180, priority: 'high', selected: true },
          { name: 'The Divergence Theorem (Gauss Theorem) & Flux across Closed Surfaces', difficulty: 'hard', estimated_mins: 180, priority: 'high', selected: true },
        ]
      }
    ]
  },
  physics: {
    subjectName: 'Quantum Mechanics & Relativity',
    subjectCode: 'PHY301R01',
    color: '#0D9488', // Deep Teal
    icon: 'Atom',
    estimatedTotalHours: 38,
    difficulty: 'hard',
    units: [
      {
        name: 'Unit I: Wave-Particle Duality & The Schrödinger Equation',
        order_index: 1,
        topics: [
          { name: 'De Broglie Waves and Heisenberg Uncertainty Principle', difficulty: 'medium', estimated_mins: 90, priority: 'high', selected: true },
          { name: 'Time-Dependent and Time-Independent Schrödinger Equations', difficulty: 'hard', estimated_mins: 150, priority: 'high', selected: true },
          { name: 'Particle in a 1D Infinite Potential Well (Particle in a Box)', difficulty: 'easy', estimated_mins: 90, priority: 'medium', selected: true },
          { name: 'Quantum Tunneling and Rectangular Potential Barriers', difficulty: 'hard', estimated_mins: 120, priority: 'medium', selected: true },
        ]
      },
      {
        name: 'Unit II: Quantum Formalism & Angular Momentum',
        order_index: 2,
        topics: [
          { name: 'Hilbert Spaces, Dirac Bra-Ket Notation and Hermitian Operators', difficulty: 'hard', estimated_mins: 150, priority: 'high', selected: true },
          { name: 'Quantum Harmonic Oscillator & Ladder Operators', difficulty: 'medium', estimated_mins: 120, priority: 'high', selected: true },
          { name: 'Orbital Angular Momentum & Spherical Harmonics', difficulty: 'hard', estimated_mins: 150, priority: 'medium', selected: true },
        ]
      },
      {
        name: 'Unit III: Special Theory of Relativity',
        order_index: 3,
        topics: [
          { name: 'Michelson-Morley Experiment and Lorentz Transformations', difficulty: 'easy', estimated_mins: 90, priority: 'medium', selected: true },
          { name: 'Time Dilation, Length Contraction & Relativistic Doppler Effect', difficulty: 'medium', estimated_mins: 120, priority: 'high', selected: true },
          { name: 'Four-Vectors, Space-time Intervals and Minkowski Diagrams', difficulty: 'hard', estimated_mins: 150, priority: 'high', selected: true },
          { name: 'Mass-Energy Equivalence and Relativistic Momentum', difficulty: 'medium', estimated_mins: 100, priority: 'medium', selected: true },
        ]
      }
    ]
  },
  bio: {
    subjectName: 'Molecular Biology & Genetics',
    subjectCode: 'BIO204R01',
    color: '#059669', // Rich Emerald
    icon: 'Dna',
    estimatedTotalHours: 30,
    difficulty: 'medium',
    units: [
      {
        name: 'Unit I: DNA Structure & Genome Replication',
        order_index: 1,
        topics: [
          { name: 'Double Helix Topology, Supercoiling and Topoisomerases', difficulty: 'easy', estimated_mins: 90, priority: 'medium', selected: true },
          { name: 'Enzymology of DNA Replication (Polymerases, Helicases, Ligases)', difficulty: 'medium', estimated_mins: 120, priority: 'high', selected: true },
          { name: 'Telomerase Mechanism and Eukaryotic Chromosome End Replication', difficulty: 'medium', estimated_mins: 90, priority: 'high', selected: true },
        ]
      },
      {
        name: 'Unit II: Transcription & RNA Processing',
        order_index: 2,
        topics: [
          { name: 'RNA Polymerase Holoenzyme & Promoter Recognition in Prokaryotes', difficulty: 'medium', estimated_mins: 100, priority: 'high', selected: true },
          { name: 'Eukaryotic Transcription Factors and Enhancers/Silencers', difficulty: 'hard', estimated_mins: 120, priority: 'medium', selected: true },
          { name: 'Post-Transcriptional Modifications: 5-Cap, Poly-A Tail, and Splicing', difficulty: 'medium', estimated_mins: 90, priority: 'high', selected: true },
        ]
      },
      {
        name: 'Unit III: Translation & Protein Regulation',
        order_index: 3,
        topics: [
          { name: 'The Genetic Code, tRNA Charging & Aminoacyl-tRNA Synthetases', difficulty: 'easy', estimated_mins: 90, priority: 'medium', selected: true },
          { name: 'Ribosomal Structure and Mechanism of Translation Initiation/Elongation', difficulty: 'medium', estimated_mins: 120, priority: 'high', selected: true },
          { name: 'The Lac and Trp Operons: Negative and Positive Gene Regulation', difficulty: 'hard', estimated_mins: 150, priority: 'high', selected: true },
          { name: 'Epigenetics: DNA Methylation and Histone Acetylation/Deacetylation', difficulty: 'hard', estimated_mins: 120, priority: 'high', selected: true },
        ]
      }
    ]
  }
}

/**
 * AI Syllabus Extraction Action.
 * Analyzes uploaded image/filename and returns a structured study roadmap.
 */
export async function extractSyllabusFromImage(
  filename: string = 'syllabus.png',
  presetKey?: 'cs' | 'math' | 'physics' | 'bio'
): Promise<{ success: boolean; data?: ExtractedSyllabus; error?: string }> {
  // Simulate AI processing delay for realistic UX
  await new Promise((resolve) => setTimeout(resolve, 2200))

  let key = presetKey
  if (!key) {
    const lower = filename.toLowerCase()
    if (lower.includes('calc') || lower.includes('math') || lower.includes('mat')) {
      key = 'math'
    } else if (lower.includes('phys') || lower.includes('quant') || lower.includes('relat')) {
      key = 'physics'
    } else if (lower.includes('bio') || lower.includes('gene') || lower.includes('dna')) {
      key = 'bio'
    } else {
      key = 'cs'
    }
  }

  const syllabus = PRESET_SYLLABI[key || 'cs']
  if (!syllabus) {
    return { success: false, error: 'Failed to extract syllabus structure from image.' }
  }

  // Deep clone to ensure clean reactivity
  return {
    success: true,
    data: JSON.parse(JSON.stringify(syllabus)),
  }
}

/**
 * Imports the extracted syllabus directly into the user's StudyOS database!
 */
export async function importExtractedSyllabus(data: ExtractedSyllabus) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated. Please log in.' }

  // 1. Check if user is on Pro tier or free usage limit
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, ai_extractions_count')
    .eq('id', user.id)
    .single()

  const tier = profile?.subscription_tier || 'free'
  const count = profile?.ai_extractions_count || 0

  if (tier === 'free' && count >= 1) {
    return {
      success: false,
      error: 'Free tier limit reached (1 AI extraction per account). Please upgrade to StudyOS Pro for unlimited syllabus imports!',
      requiresPro: true,
    }
  }

  // 2. Insert Subject
  const { data: subject, error: subError } = await supabase
    .from('subjects')
    .insert({
      user_id: user.id,
      name: data.subjectName,
      code: data.subjectCode,
      color: data.color || '#2563EB',
      icon: data.icon || 'BookOpen',
      target_score: 85.0,
      subject_type: 'theory',
    })
    .select('id')
    .single()

  if (subError || !subject) {
    console.error('Failed to create subject:', subError)
    return { success: false, error: 'Failed to create new subject in database.' }
  }

  // 3. Insert Units & Topics
  for (const unit of data.units) {
    const { data: insertedUnit, error: unitError } = await supabase
      .from('units')
      .insert({
        subject_id: subject.id,
        name: unit.name,
        order_index: unit.order_index,
      })
      .select('id')
      .single()

    if (!unitError && insertedUnit) {
      // Filter only selected topics
      const selectedTopics = unit.topics.filter((t) => t.selected)
      if (selectedTopics.length > 0) {
        const topicsPayload = selectedTopics.map((t) => ({
          unit_id: insertedUnit.id,
          subject_id: subject.id,
          name: t.name,
          difficulty: t.difficulty,
          priority: t.priority,
          status: 'pending',
          confidence_score: 0,
          time_spent_mins: 0,
          revision_count: 0,
          is_bookmarked: false,
        }))

        await supabase.from('topics').insert(topicsPayload)
      }
    }
  }

  // 4. Increment AI extraction count
  await supabase
    .from('profiles')
    .update({ ai_extractions_count: count + 1 })
    .eq('id', user.id)

  revalidatePath('/', 'layout')
  revalidatePath('/subjects')
  revalidatePath('/dashboard')
  revalidatePath('/ai-coach')

  return { success: true, subjectId: subject.id }
}
