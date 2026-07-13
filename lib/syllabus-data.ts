export interface TopicData {
  name: string
}

export interface UnitData {
  name: string
  topics: TopicData[]
}

export interface SubjectData {
  id: string
  name: string
  code: string
  color: string
  icon: string
  type: 'theory' | 'lab'
  units: UnitData[]
}

export const SYLLABUS_DATA: SubjectData[] = [
  {
    id: 'eng-math-3',
    name: 'Engineering Mathematics III',
    code: 'MAT201R01',
    color: '#2563EB', // Sapphire Blue
    icon: 'Calculator',
    type: 'theory',
    units: [
      {
        name: 'UNIT I – Laplace Transforms',
        topics: [
          { name: 'Introduction to Laplace transforms' },
          { name: 'Sufficient conditions for existence' },
          { name: 'Properties of the Laplace transform' },
          { name: 'Transforms of derivatives and derivatives of transforms' },
          { name: 'Shifting theorems' },
          { name: 'Change of scale property' },
          { name: 'Convolution theorem' },
          { name: 'Periodic function theorem' },
          { name: 'Inverse Laplace transforms' },
          { name: 'Solution of 1st & 2nd order ODEs and simultaneous DEs using Laplace Transforms' },
          { name: 'Problems in Electrical circuits, Mechanical vibrations' },
        ],
      },
      {
        name: 'UNIT II – Fourier Series',
        topics: [
          { name: 'Introduction to Fourier series' },
          { name: 'Dirichlet\'s conditions' },
          { name: 'Fourier series of odd and even functions' },
          { name: 'Half-Range Fourier series and Parseval\'s theorem' },
          { name: 'Root-mean square value of a function' },
          { name: 'Complex form of Fourier series' },
          { name: 'Harmonic analysis' },
          { name: 'Frequency response and oscillating systems' },
        ],
      },
      {
        name: 'UNIT III – Complex Differentiation',
        topics: [
          { name: 'Analytic functions' },
          { name: 'Cauchy Riemann Equations and other properties' },
          { name: 'Harmonic functions' },
          { name: 'Construction of an Analytic function by Milne-Thomson method only' },
          { name: 'Conformal mappings' },
          { name: 'Mappings sinz, e^z, 1/z only' },
          { name: 'Mobius transformation' },
          { name: 'Analysing AC circuits' },
          { name: 'Heat transfer problems' },
        ],
      },
      {
        name: 'UNIT IV – Complex Integration',
        topics: [
          { name: 'Cauchy\'s integral theorem and integral formula' },
          { name: 'Taylor and Laurent\'s series' },
          { name: 'Types of Singularities' },
          { name: 'Calculus of residues' },
          { name: 'Cauchy\'s residue theorem' },
          { name: 'Evaluation of Real definite integrals (Type I and II only) by contour integration' },
          { name: 'Problems in power spectrum involving contour integrals' },
        ],
      }
    ],
  },
  {
    id: 'electric-networks',
    name: 'Electric Networks',
    code: 'EEE201R01',
    color: '#0D9488', // Deep Teal
    icon: 'Zap',
    type: 'theory',
    units: [
      {
        name: 'UNIT I – Circuit Analysis & Network Theorems',
        topics: [
          { name: 'Analysis of DC and AC electrical circuits (dependent and independent sources)' },
          { name: 'Supermesh and Supernode Analysis (independent sources)' },
          { name: 'Star Delta Transformation' },
          { name: 'Thevenin\'s theorem' },
          { name: 'Norton\'s theorem' },
          { name: 'Superposition theorem' },
          { name: 'Maximum power transfer theorem' },
          { name: 'Reciprocity theorem' },
          { name: 'Substitution theorem' },
          { name: 'Millman\'s theorem' },
        ],
      },
      {
        name: 'UNIT II – Circuit Transients, Resonance & Coupled Circuits',
        topics: [
          { name: 'Transient and steady state response of series RL, RC and RLC Circuits using Laplace transform' },
          { name: 'Series and parallel resonance' },
          { name: 'Frequency response (Magnitude & Phase)' },
          { name: 'Quality factor and Bandwidth' },
          { name: 'Coupled circuits: Dot rule' },
          { name: 'Types of inductive coupling in series & parallel - Analysis' },
          { name: 'Conductively coupled equivalent circuit' },
          { name: 'Single tuned circuits' },
        ],
      },
      {
        name: 'UNIT III – Two Port Networks & Filters',
        topics: [
          { name: 'Characterization of two port networks in terms of Z, Y, h and ABCD parameters' },
          { name: 'Symmetrical network: Characteristic impedance, Propagation constant' },
          { name: 'Design and analysis of T and π networks in terms of Z0 and γ' },
          { name: 'Filters: Principle of operation - Classification' },
          { name: 'Attenuation and phase constant-cut off Frequency' },
          { name: 'Analysis of constant K low pass and high pass filters' },
        ],
      },
      {
        name: 'UNIT IV – Network Synthesis and Three Phase Circuits',
        topics: [
          { name: 'Synthesis of single port networks: Positive real functions' },
          { name: 'Synthesis of one port RL, RC, LC Immittance functions using Foster and Cauer methods' },
          { name: 'Three Phase Circuits: Three phase balanced voltage sources' },
          { name: 'Analysis of three phase 3 wire, 4 wire star connected and delta connected loads' },
          { name: 'Power calculations - Balanced and unbalanced loads' },
        ],
      }
    ],
  },
  {
    id: 'analog-electronic',
    name: 'Analog Electronic Circuits',
    code: 'EIE218R02',
    color: '#0284C7', // Cerulean
    icon: 'Cpu',
    type: 'theory',
    units: [
      {
        name: 'UNIT I – BJT and FET Biasing',
        topics: [
          { name: 'Biasing of BJT - Base Bias' },
          { name: 'Emitter Feedback Bias, Voltage Divider Biasing and Collector Feedback Bias' },
          { name: 'Stability Factor - Bias Compensation' },
          { name: 'Biasing of JFET - Gate Bias, Self-Bias, Voltage Divider Bias' },
          { name: 'Source Bias, Current Source Bias' },
          { name: 'Biasing of MOSFET- Voltage Divider and Drain Feedback Bias' },
        ],
      },
      {
        name: 'UNIT II – Amplifier Analysis, Feedback Amplifiers and Oscillators',
        topics: [
          { name: 'Small signal model of CE amplifier - re model' },
          { name: 'Calculation of input impedance, output impedance, current gain, and voltage gain' },
          { name: 'Frequency response - Miller effect' },
          { name: 'MOSFET Amplifiers - Small Signal Parameters, Equivalent Circuit' },
          { name: 'Common Source Amplifier - Common Drain Amplifier' },
          { name: 'Effect of negative feedback on amplifiers - Feedback connection types - Merits and demerits' },
          { name: 'Oscillators - principle of operation - LC Oscillators: Hartley and Colpitts Oscillator' },
        ],
      },
      {
        name: 'UNIT III – OP-AMP Characteristics and Applications',
        topics: [
          { name: 'Op-amp Block Diagram - Equivalent Circuit' },
          { name: 'DC Characteristics: Input bias current, offset current, offset voltage, Thermal drift' },
          { name: 'CMRR - AC characteristics: Slew rate and Frequency response' },
          { name: 'Op-amp Applications: Inverting, noninverting, and Differential Amplifiers' },
          { name: 'Inverting summing amplifier, Voltage follower, Subtractor, Integrator' },
          { name: 'Instrumentation Amplifier, V to I and I to V Converters' },
          { name: 'Precision Rectifiers: Half and full wave - Sample & Hold circuit' },
        ],
      },
      {
        name: 'UNIT IV – Comparators, Signal Generators, Data Converters and Timers',
        topics: [
          { name: 'Comparator: Inverting and Noninverting Comparators' },
          { name: 'Applications of Comparator: Zero Crossing Detector - Inverting Schmitt Trigger' },
          { name: 'Oscillators: RC Phase Shift Oscillator, and Wein Bridge Oscillator' },
          { name: 'Data Converters: DAC: Binary Weighted Resistor, R-2R and Inverted R-2R Ladder Network' },
          { name: 'ADC: Flash Type, Successive Approximation Type' },
          { name: 'IC 555 Timer: Internal circuit diagram - Astable and Monostable multivibrators' },
        ],
      }
    ],
  },
  {
    id: 'digital-electronics',
    name: 'Digital Electronics',
    code: 'ECE105R01',
    color: '#059669', // Rich Emerald
    icon: 'Binary',
    type: 'theory',
    units: [
      {
        name: 'UNIT I – Boolean Simplification & Logic Families',
        topics: [
          { name: 'Review of number systems and codes' },
          { name: 'Boolean functions: Boolean laws - Simplification using the laws' },
          { name: 'Minterms - Maxterms - Sum of product and product of sum forms' },
          { name: 'Minimisation using Karnaugh Map - Quine McClusky method' },
          { name: 'NAND, NOR Implementation' },
          { name: 'Digital Logic Families: RTL- DTL - ECL - TTL - CMOS logic families' },
          { name: 'Characteristics - Comparison of IC families' },
        ],
      },
      {
        name: 'UNIT II – Combinational Circuits',
        topics: [
          { name: 'Combinational circuits: Half and full Adder, Ripple-Carry adder, BCD adder' },
          { name: 'Half and Full Subtractor, Parallel Adder/Subtractor - 2-bit Magnitude comparator' },
          { name: 'Multiplexer - Demultiplexer' },
          { name: 'Encoder : Decimal to BCD, Octal to Binary, Priority Encoder' },
          { name: 'Decoder : 2-4 Line, 3-8 Line, BCD to Decimal, BCD to Seven Segment decoder' },
          { name: 'Code Converters : Gray to Binary, Binary to Gray' },
          { name: 'Implementation of Boolean functions using Multiplexer and Demultiplexer' },
        ],
      },
      {
        name: 'UNIT III – Sequential Circuits',
        topics: [
          { name: 'Flip Flops: RS, D, JK and T Flip Flops' },
          { name: 'Characteristic equation and excitation table - Master Slave Flip Flops' },
          { name: 'Realization of one Flip Flop using other Flip Flops' },
          { name: 'Shift Registers: SISO, SIPO, PISO, PIPO, Bi-Directional and Universal Shift Register using multiplexer' },
          { name: 'Counters: Ripple counter - Modulo N counter - Up-down ripple counter' },
          { name: 'Synchronous counter - Ring counter, Johnson counter' },
          { name: 'Sequence generator using counters and shift register' },
        ],
      },
      {
        name: 'UNIT IV – PLDS & Memories',
        topics: [
          { name: 'Memories: Memory basics - Types of Memories: RAM, ROM, PROM' },
          { name: 'Programmable Devices: SPLD: PAL, PLA' },
          { name: 'Introduction to GAL and CPLD' },
        ],
      }
    ],
  },
  {
    id: 'ee-measurements',
    name: 'Electrical & Electronic Measurements',
    code: 'EIE102',
    color: '#D97706', // Warm Gold
    icon: 'Gauge',
    type: 'theory',
    units: [
      {
        name: 'UNIT I – Introduction to Measurement Systems',
        topics: [
          { name: 'Generalized measurement system' },
          { name: 'Classification of measurement systems and instruments' },
          { name: 'Measurement system characteristics - Static characteristics' },
          { name: 'Accuracy, Precision, Sensitivity, Linearity, Resolution, Reproducibility, Repeatability' },
          { name: 'Signal to noise ratio, Drift, Hysteresis' },
          { name: 'Loading effects due to shunt and series connected instruments' },
          { name: 'Dynamic characteristics: Speed of response, Measuring lag, Fidelity, Dynamic error, Limiting errors' },
          { name: 'Types of errors - Statistical treatment of data: Arithmetic mean, Histogram' },
          { name: 'Measure of dispersion, Range, Deviation, Average deviation, Standard deviation, Variance' },
          { name: 'Normal and Gaussian curve of errors - Probable error' },
        ],
      },
      {
        name: 'UNIT II – DC Measurement systems',
        topics: [
          { name: 'Principle, Theory of operation and constructional details of D\'Arsonval PMMC' },
          { name: 'Moving iron instruments - Torque equation' },
          { name: 'Extending the ranges of ammeter (Ayrton shunt) and voltmeter' },
          { name: 'Series and shunt type ohmmeter, Megger' },
          { name: 'DC Bridges: Wheatstone\'s bridge, Kelvin\'s double bridge' },
          { name: 'Analog multimeter' },
        ],
      },
      {
        name: 'UNIT III – AC Measurement Systems',
        topics: [
          { name: 'Measurement using current and potential transformers' },
          { name: 'Electrodynamometer type wattmeter, Hall Effect wattmeter' },
          { name: 'Single phase and three phase power measurement' },
          { name: 'Power factor measurement by two wattmeter method' },
          { name: 'Induction type energy meter' },
          { name: 'AC bridges: Maxwell\'s bridge, Anderson\'s bridge, Schering\'s bridge, Wien\'s bridge' },
          { name: 'Phasor diagram for bridges - True RMS voltmeter, Vector voltmeter - Q meter' },
        ],
      },
      {
        name: 'UNIT IV – Oscilloscopes and Digital Measurement System',
        topics: [
          { name: 'Oscilloscopes - Types: Dual beam, Dual trace - Sampling oscilloscope - Digital storage oscilloscope - Softscope' },
          { name: 'Signal analyzer (Block diagram approach): Wave analyzer, Harmonic distortion analyzer, Spectrum analyzer' },
          { name: 'Digital Measurement System - Digital counter' },
          { name: 'Digital methods of measuring period, frequency, phase angle, pulse width, frequency ratio' },
          { name: 'Concept of digital voltmeter - Digital multimeter' },
        ],
      }
    ],
  },
  {
    id: 'measurements-lab',
    name: 'Electrical & Electronics Measurements Lab',
    code: 'EIE103',
    color: '#E11D48', // Crimson
    icon: 'FlaskConical',
    type: 'lab',
    units: [
      {
        name: 'Laboratory Experiments',
        topics: [
          { name: 'Measurement of low resistance using Kelvin\'s double bridge' },
          { name: 'Measurement of inductance using Anderson\'s bridge' },
          { name: 'Measurement of inductance using Maxwell\'s bridge' },
          { name: 'Measurement of capacitance using Schering\'s bridge' },
          { name: 'Measurement of three phase power using two wattmeter methods' },
          { name: 'Conversion of ammeter into voltmeter' },
          { name: 'Measurement of reactive power in three phase balanced load using single wattmeter' },
          { name: 'Design of multirange voltmeter' },
          { name: 'Design of multirange ammeter' },
          { name: 'Analysis of frequency spectrum of a low pass filter using DSO' },
          { name: 'Calibration of single phase energy meter by phantom loading for UPF, 0.86 lagging and leading' },
          { name: 'Calibration of three phase energy meters using energy meter test bench' },
        ],
      },
    ],
  },
  {
    id: 'analog-circuits-lab',
    name: 'Analog Circuits Laboratory',
    code: 'EIE229',
    color: '#475569', // Slate Steel
    icon: 'Microscope',
    type: 'lab',
    units: [
      {
        name: 'Laboratory Experiments',
        topics: [
          { name: 'Design of emitter feedback, collector feedback, and voltage divider bias using BJT' },
          { name: 'Frequency response characteristics of RC coupled amplifier using BJT' },
          { name: 'BJT, JFET, and MOSFET as a switch' },
          { name: 'Frequency response characteristics of Common Source amplifier' },
          { name: 'Design of Hartley oscillator' },
          { name: 'Frequency response of current series amplifier (with and without feedback)' },
          { name: 'Design of the adder circuit using IC 741' },
          { name: 'Design of Astable multivibrator using IC 741' },
          { name: 'Design of Schmitt trigger using IC 741' },
          { name: 'Design a precision halfwave and full-wave rectifier circuit' },
          { name: 'Design of R-2R ladder network using IC 741' },
          { name: 'Design of monostable multivibrator using IC 555 Timer' },
        ],
      },
    ],
  },
]
