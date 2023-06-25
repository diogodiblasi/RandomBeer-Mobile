import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('beer.db');

const BeerApp = () => {
  const [beerData, setBeerData] = useState(null);
  const [buscaHistorico, setBuscaHistorico] = useState([]);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS cervejas (id INTEGER PRIMARY KEY AUTOINCREMENT, brand TEXT, name TEXT, style TEXT, hop TEXT, yeast TEXT, malts TEXT, ibu TEXT, alcohol TEXT, blg TEXT)'
      );
    });
    loadBuscaHistorico();
  }, []);

  const fetchRandomBeer = async () => {
    try {
      const response = await fetch('https://random-data-api.com/api/beer/random_beer');
      const data = await response.json();
      setBeerData(data);

      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO cervejas (brand, name, style, hop, yeast, malts, ibu, alcohol, blg) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            data.brand,
            data.name,
            data.style,
            data.hop,
            data.yeast,
            data.malts,
            data.ibu,
            data.alcohol,
            data.blg,
          ],
          (txObj, resultSet) => {
            if (resultSet.rowsAffected > 0) {
              console.log('Cerveja inserida com sucesso!');
            }
          },
          (txObj, error) => {
            console.error('Erro ao inserir!', error);
          }
        );
      });

      loadBuscaHistorico();
    } catch (error) {
      console.error('Erro ao carregar:', error);
    }
  };

  const loadBuscaHistorico = ()=> {
    db.transaction((tx) => {
      tx.executeSql('SELECT * FROM cervejas', [], (txObj, resultSet) => {
        const searchEntries = [];
        for (let i = 0; i < resultSet.rows.length; i++) {
          const row = resultSet.rows.item(i);
          const entry = {
            id: row.id,
            brand: row.brand,
            name: row.name,
            style: row.style,
            hop: row.hop,
            yeast: row.yeast,
            malts: row.malts,
            ibu: row.ibu,
            alcohol: row.alcohol,
            blg: row.blg,
          };
          searchEntries.push(entry);
        }
        setBuscaHistorico(searchEntries);
      });
    });
  };

  const renderSearchItem = ({ item }) => (
    <TouchableOpacity onPress={() => showBeerDetails(item)}>
      <View style={styles.searchItem}>
        <Text>Brand: {item.brand}</Text>
        <Text>Name: {item.name}</Text>
        <Text>Style: {item.style}</Text>
      </View>
    </TouchableOpacity>
  );

  const showBeerDetails = (beer) => {
    setBeerData(beer);
  };

  const renderSeparator = () => (
    <View style={styles.separator} />
  );


  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button title="BUSCAR CERVEJA" onPress={fetchRandomBeer} />

      </View>

      {beerData && (
        <View style={styles.beerDetails}>
          <Text>Brand: {beerData.brand}</Text>
          <Text>Name: {beerData.name}</Text>
          <Text>Style: {beerData.style}</Text>
          <Text>Hop: {beerData.hop}</Text>
          <Text>Yeast: {beerData.yeast}</Text>
          <Text>Malts: {beerData.malts}</Text>
          <Text>IBU: {beerData.ibu}</Text>
          <Text>Alcohol: {beerData.alcohol}</Text>
          <Text>BLG: {beerData.blg}</Text>
        </View>
      )}
   <Text style={styles.searchHistoryTitle}>Histórico:</Text>
      <FlatList
       data={buscaHistorico}
       renderItem={renderSearchItem}
       keyExtractor={(item) => item.id.toString()}
       ItemSeparatorComponent={renderSeparator}
       style={styles.searchHistoryList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '30%',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  beerDetails: {
    marginTop: 20,
  },
  searchHistoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  searchHistoryList: {
    marginTop: 10,
  },
  searchItem: {
    marginBottom: 8,
  },
  separator: {
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 4,
    width: '90%',
    alignSelf: 'center',
  },
  
});

export default BeerApp;