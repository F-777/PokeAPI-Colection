import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Modal, ProgressBar } from 'react-bootstrap';


const PokeApi = () => {
  const [query, setQuery] = useState('');
  const [pokemon, setPokemon] = useState(null);
  const [recommendedPokemon, setRecommendedPokemon] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pokemonDescription, setPokemonDescription] = useState(''); // State baru untuk deskripsi Pokémon

  // Mengambil rekomendasi Pokémon
  const fetchRecommendedPokemon = async () => {
    const recommendedIds = Array.from({ length: 20 }, (_, i) => i + 1); // Mengambil 20 Pokémon pertama
    const promises = recommendedIds.map(async (id) => {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      return response.json();
    });
    const results = await Promise.all(promises);
    setRecommendedPokemon(results);
  };

  // Mengambil rekomendasi saat halaman pertama kali dimuat
  useEffect(() => {
    fetchRecommendedPokemon();
  }, []);

  const fetchPokemonSpecies = async (id) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    const data = await response.json();
    
    // Ambil deskripsi dalam bahasa Inggris
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
    if (value <= 50) return 'success'; // Hijau (lemah)
    if (value <= 80) return 'warning'; // Kuning (lumayan kuat)
    if (value <= 100) return 'danger'; // Oranye/Merah (kuat)
    return 'danger'; // Merah (sangat kuat)
  };

  return (
    <div className="app">
      {/* Bagian Header */}
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', gap: '2rem'}}>
        <img src="src/assets/LogoPokemon.png" alt="logo" className='logos' style={{ width: '325px', height: '120px'}}/>
        <Form onSubmit={handleSearch} className="search-form">
          <Form.Control
            type="text"
            placeholder="Enter Pokémon name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="form-control"
            style={{ padding: '20px 40px'}}
          />
          <Button variant="warning" type="submit" className="btn-submit">Search</Button>
        </Form>
      </div>

      {/* Menampilkan rekomendasi atau hasil pencarian */}
      {!pokemon && (
        <>
          <div className="recommendations" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {recommendedPokemon.map((poke) => (
              <Card key={poke.id} className="pokemon-card" style={{ margin: '10px', cursor: 'pointer' }} onClick={async () => { 
                setPokemon(poke); 
                const description = await fetchPokemonSpecies(poke.id); // Fetch deskripsi Pokémon yang di-klik
                setPokemonDescription(description);
                setShowModal(true); 
              }}>
                <Card.Img variant="top" src={poke.sprites.front_default} alt={poke.name} />
                <Card.Body>
                  <Card.Title className='front' style={{ fontFamily: 'DM Sans,serif', fontSize: '2rem', fontWeight: '500', color: 'gold'}}>{poke.name}</Card.Title>
                  <Card.Text>
                    Height: {poke.height}
                  </Card.Text>
                  <Card.Text>
                    Weight: {poke.weight}
                  </Card.Text>
                  <Card.Text>
                    Type: {poke.types.map((type) => type.type.name).join(', ')}
                  </Card.Text>
                </Card.Body>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Menampilkan hasil pencarian */}
      {pokemon && (
        <div className="search-result">
          <Card className="pokemon-card" onClick={handleShow} style={{ cursor: 'pointer', marginTop: '20px' }}>
            <Card.Body>
              <Card.Title 
                style={{
                    fontFamily: 'DM Sans,serif',
                    fontSize: '2rem',
                    fontWeight: 'normal',
                    color: 'gold'
                }}>{pokemon.name}</Card.Title>
              <Card.Img variant="top" src={pokemon.sprites.front_default} alt={pokemon.name} />
              <Card.Text>
                Height: {pokemon.height}
              </Card.Text>
              <Card.Text>
                Weight: {pokemon.weight}
              </Card.Text>
              <Card.Text>
                Type: {pokemon.types.map((type) => type.type.name).join(', ')}
              </Card.Text>
            </Card.Body>
          </Card>

          {/* Modal untuk menampilkan detail Pokémon */}
          <Modal show={showModal} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>{pokemon.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <img
                src={pokemon.sprites.front_default}
                alt={pokemon.name}
                style={{ width: '180px', height: '180px' }}
              />
              <p><strong>Height:</strong> {pokemon.height}</p>
              <p><strong>Weight:</strong> {pokemon.weight}</p>
              <p><strong>Type:</strong> {pokemon.types.map((type) => type.type.name).join(', ')}</p>
              <p><strong>Abilities:</strong> {pokemon.abilities.map((ability) => ability.ability.name).join(', ')}</p>
              <p><strong>Description:</strong> {pokemonDescription}</p> {/* Menampilkan deskripsi Pokémon */}
              <p><strong>Stats:</strong></p>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {pokemon.stats.map((stat) => (
                  <li key={stat.stat.name} style={{ marginBottom: '10px' }}>
                    <strong>{stat.stat.name}:</strong> {stat.base_stat}
                    <ProgressBar
                      now={stat.base_stat}
                      max={150}
                      label={`${stat.base_stat}`}
                      style={{ height: '15px', marginTop: '5px' }}
                      variant={getStatColor(stat.base_stat)}
                    />
                  </li>
                ))}
              </ul>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
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