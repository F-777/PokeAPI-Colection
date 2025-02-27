import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Modal, ProgressBar } from 'react-bootstrap';


const PokeApi = () => {
  const [query, setQuery] = useState('');
  const [pokemon, setPokemon] = useState(null);
  const [page, setPage] = useState(1);
  const [recommendedPokemon, setRecommendedPokemon] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pokemonDescription, setPokemonDescription] = useState(''); // new state about description pokemon
  const limit = 24;
  const totalPages = Math.ceil(1200 / limit);

  // Mengambil rekomendasi Pokémon
  const fetchRecommendedPokemon = async () => {
    const recommendedIds = Array.from({ length: 1000 }, (_, i) => i + 1); // added firstly pokemon recomendation
    const promises = recommendedIds.map(async (id) => {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      return response.json();
    });
    const results = await Promise.all(promises);
    setRecommendedPokemon(results);
  };

  // input recomended page in firstly 
  useEffect(() => {
    fetchRecommendedPokemon();
  }, []);

  const fetchPokemonSpecies = async (id) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    const data = await response.json();

    // pull description in english language
    const flavorTextEntry = data.flavor_text_entries.find(entry => entry.language.name === 'en');
    return flavorTextEntry ? flavorTextEntry.flavor_text : 'No description available for this Pokémon.';
  };

  const searchPokemon = async () => {
    try {
      setError('');
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
      if (!response.ok) throw new Error('Pokémon not found!');
      const data = await response.json();
      setPokemon(data);

      // Ambil deskripsi Pokémon
      const description = await fetchPokemonSpecies(data.id);
      setPokemonDescription(description);

    } catch (err) {
      setError(err.message);
      setPokemon(null);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query) searchPokemon();
  };

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const getStatColor = (value) => {
    if (value <= 50) return 'success'; // gold
    if (value <= 80) return 'warning'; // gold
    if (value <= 100) return 'danger'; // gold
    return 'danger'; // gold
  };


  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const displayedPokemon = recommendedPokemon.slice(startIndex, endIndex);


  return (
    <div className="app">
      {/* Header */}
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', gap: '3rem' }}>
        <img src="src/assets/LogoPokemon.png" alt="logo" className='logos' style={{ width: '340px', height: '130px' }} />
        <Form onSubmit={handleSearch} className="search-form">
          <Form.Control
            type="text"
            placeholder="Enter Pokémon name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="form-control"
            style={{ padding: '20px 40px' }}
          />
          <Button variant="warning" type="submit" className="btn-submit">Search</Button>
        </Form>
      </div>
      <div className='pagination-btn' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '2rem' }}>
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className='preview-btn'
          style={{
            color: 'gold',
            fontFamily: 'sans-serif',
            fontWeight: 'normal',
            fontSize: '15px',
            padding: '10px 20px'
          }}
        >
          Prev
        </button>

        <span className='page-slide' style={{
          alignItems: 'center',
          fontFamily: 'sans-serif',
          fontSize: '2rem',
          color: 'gold'
        }}>
          {page} / {totalPages}
        </span>

        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          className='next-btn'
          style={{
            color: 'gold',
            fontFamily: 'sans-serif',
            fontWeight: 'normal',
            fontSize: '15px',
            padding: '10px 20px'
          }}
        >
          Next
        </button>
      </div>

      {/* present recomended collection */}
      {!pokemon && (
        <>
          <div className="recommendations" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {displayedPokemon.map((poke) => (
              <Card key={poke.id} className="pokemon-card" style={{ margin: '10px', cursor: 'pointer' }} onClick={async () => {
                setPokemon(poke);
                const description = await fetchPokemonSpecies(poke.id); // Fetch clicked Pokemon description
                setPokemonDescription(description);
                setShowModal(true);
              }}>
                <Card.Img variant="top" src={poke.sprites.front_default} alt={poke.name} />
                <Card.Body>
                  <Card.Title className='front' style={{ fontFamily: 'sans-serif', fontSize: '24px', fontWeight: '600', color: 'gold' }}>{poke.name}</Card.Title>
                  <Card.Text className='height' style={{ fontFamily: 'sans-serif', fontSize: '18px', fontWeight: '500', color: 'gold'}}>
                    Height: {poke.height}
                  </Card.Text>
                  <Card.Text className='weight' style={{ fontFamily: 'sans-serif', fontSize: '18px', fontWeight: '500', color: 'gold'}}>
                    Weight: {poke.weight}
                  </Card.Text>
                  <Card.Text className='types' style={{ fontFamily: 'sans-serif', fontSize: '18px', fontWeight: '500', color: 'gold'}}>
                    Type: {poke.types.map((type) => type.type.name).join(', ')}
                  </Card.Text>
                </Card.Body>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Present the searching object */}
      {pokemon && (
        <div className="search-result">
          <Card className="pokemon-card" onClick={handleShow} style={{ cursor: 'pointer', marginTop: '20px' }}>
            <Card.Body>
              <Card.Title
                style={{
                  fontFamily: 'sans-serif',
                  fontSize: '2rem',
                  fontWeight: '600',
                  color: 'gold'
                }}>{pokemon.name}</Card.Title>
              <Card.Img variant="top" src={pokemon.sprites.front_default} alt={pokemon.name} />
              <Card.Text className='height' style={{ fontFamily: 'sans-serif', fontSize: '18px', fontWeight: '500', color: 'gold'}}>
                Height: {pokemon.height}
              </Card.Text>
              <Card.Text className='weight' style={{ fontFamily: 'sans-serif', fontSize: '18px', fontWeight: '500', color: 'gold'}}>
                Weight: {pokemon.weight}
              </Card.Text>
              <Card.Text className='types' style={{ fontFamily: 'sans-serif', fontSize: '18px', fontWeight: '500', color: 'gold'}}>
                Type: {pokemon.types.map((type) => type.type.name).join(', ')}
              </Card.Text>
            </Card.Body>
          </Card>

          {/* modal about present pokemon details */}
          <Modal show={showModal} onHide={handleClose} className='show-detils' style={{
                alignItems: 'center',
                border: '3px solid gold',
                borderRadius: '8px', 
                backgroundColor: 'maroon',
                paddingLeft: '3rem',
                paddingRight: '5rem',
                marginLeft: '1.5rem'
             }}
          >
            <Modal.Header>
              <Modal.Title className='title-detils' style={{ 
                   fontFamily: 'sans-serif', 
                   fontWeight: '700',
                   fontSize: '40px', 
                   textAlign: 'left', 
                   color: 'gold', 
                   marginTop: '2rem',
                   marginLeft: '2rem'
                }}
              >
                {pokemon.name}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className='body-view' style={{
                 display: 'flex',
                 flexDirection: 'column',
                 justifyContent: 'center'
               }}
            >
              <img
                src={pokemon.sprites.front_default}
                alt={pokemon.name}
                style={{ 
                  width: '180px', 
                  height: '180px', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              />
              <p style={{color: 'gold', fontFamily: 'sans-serif', marginLeft: '20px'}}><strong>Height:</strong> {pokemon.height}</p>
              <p style={{color: 'gold', fontFamily: 'sans-serif', marginLeft: '20px'}}><strong>Weight:</strong> {pokemon.weight}</p>
              <p style={{color: 'gold', fontFamily: 'sans-serif', marginLeft: '20px'}}><strong>Type:</strong> {pokemon.types.map((type) => type.type.name).join(', ')}</p>
              <p style={{color: 'gold', fontFamily: 'sans-serif', marginLeft: '20px'}}><strong>Abilities:</strong> {pokemon.abilities.map((ability) => ability.ability.name).join(', ')}</p>
              <p style={{color: 'gold', fontFamily: 'sans-serif', marginLeft: '20px'}}><strong>Description:</strong> {pokemonDescription}</p> {/* present the pokemon description*/}
              <p style={{color: 'gold', fontFamily: 'sans-serif', marginLeft: '20px'}}><strong>Stats:</strong></p>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {pokemon.stats.map((stat) => (
                  <li key={stat.stat.name} style={{ marginBottom: '10px', marginLeft: '20px', color: 'gold'}}>
                    <strong>{stat.stat.name}:</strong>
                    <ProgressBar
                      now={stat.base_stat}
                      max={150}
                      label={`${stat.base_stat}`}
                      style={{ 
                        height: '25px', 
                        marginTop: '5px', 
                        border: '2px solid gold', 
                        marginLeft: '15px', 
                        width: '120px',
                        paddingLeft: '20px',
                        paddingRight: '20px'
                      }}
                      variant={getStatColor(stat.base_stat)}
                    />
                  </li>
                ))}
              </ul>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose} className='close-btn-detils' style={{
                   padding: '10px 30px ',
                   backgroundColor: 'transparent',
                   border: '3px solid gold',
                   marginBottom: '3rem',
                   marginTop: '1.5rem',
                   marginLeft: '2rem'
                }}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default PokeApi;
