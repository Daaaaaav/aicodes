import random

POPULATION_SIZE = 14
GENES = ['low', 'mid', 'high']  
GENERATIONS = 9
MUTATE_RATE = 0.1

patients = [
    {'age': 23, 'weight': 70, 'bp': 140, 'risk': 'mid'},
    {'age': 54, 'weight': 90, 'bp': 150, 'risk': 'high'},
    {'age': 15, 'weight': 50, 'bp': 130, 'risk': 'low'}
]

def fitness(dosage, patient):
    age_factor = 0.8 if patient['age'] > 50 else 1
    weight_factor = 0.9 if patient['weight'] > 80 else 1
    bp_reduction = {'low': 5, 'mid': 10, 'high': 15} 
    predict_bp = patient['bp'] - bp_reduction[dosage] * age_factor * weight_factor
    target_bp = 125
    score = max(0, 1 - abs(predict_bp - target_bp) / 50) 
    
    if dosage == 'high' and patient['risk'] == 'low':
        score *= 0.6  
    elif dosage == 'low' and patient['risk'] == 'high':
        score *= 0.5 
    return score

def create_population():
    return [random.choice(GENES) for _ in range(POPULATION_SIZE)]

def selection(population):
    scores = [(dosage, fitness(dosage, random.choice(patients))) for dosage in population]
    scores.sort(key=lambda x: x[1], reverse=True)
    selected = [dosage for dosage, _ in scores[:10]] 
    return selected

def crossover(parent1, parent2):
    return random.choice([parent1, parent2])

def mutate(dosage):
    if random.random() < MUTATE_RATE:
        return random.choice(GENES)
    return dosage

def evolve_population(population):
    selected = selection(population)
    next_generation = []

    while len(next_generation) < POPULATION_SIZE:
        parent1 = random.choice(selected)
        parent2 = random.choice(selected)
        child = crossover(parent1, parent2)
        child = mutate(child)
        next_generation.append(child)

    return next_generation

def genetic_algorithm():
    population = create_population()
    print(f"Initial Population: {population}")

    for generation in range(GENERATIONS):
        population = evolve_population(population)
        best_individual = max(population, key=lambda x: fitness(x, random.choice(patients)))
        print(f"Generation {generation + 1}: Best Dosage - {best_individual}")

    best_dosage = max(population, key=lambda x: fitness(x, random.choice(patients)))
    print(f"Optimized Dosage after {GENERATIONS} generations: {best_dosage}")

genetic_algorithm()