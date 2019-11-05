import React from 'react'
import { StyleSheet, Text, SafeAreaView, View, FlatList, TouchableHighlight, Alert, ActivityIndicator } from 'react-native'

import Amplify, { Storage, Analytics, API, graphqlOperation } from "aws-amplify"
import { withAuthenticator } from 'aws-amplify-react-native'
import config from "./aws-exports"
import { createFileAsset } from "./src/graphql/mutations"
import { listFileAssets } from "./src/graphql/queries"
import Button from './Button';
import Constants from 'expo-constants';

Amplify.configure(config)

export default withAuthenticator(
class App extends React.Component {
    state = {
	loading: false,
	index: null,
	fileAssets: []
    }

    // Populate the list of assets using GraphQL Query
    async componentDidMount() {
        try {
	    // Use disable to work around error in aws-amplify.
	    Analytics.disable()
	    this.setState( { loading: true });
            const fileassets = await API.graphql(graphqlOperation(listFileAssets))
            this.setState({ fileAssets: fileassets.data.listFileAssets.items, loading: false})
            console.log("assets: ", this.state.fileAssets)
        } catch (err) {
	    this.setState( { loading: false });
            console.log("error: ", err)
        }
    }

  // Set the index of the selected item from the list.
  setIndex = (i) => {
    const { index } = this.state;
    console.log("selected item index :"+i);
    if (i === index) {
      /* eslint-disable no-param-reassign */
      i = null;
      /* eslint-enable no-param-reassign */
    }
    this.setState({ index: i });
  };

  // Downloads the asset using Storage API
  async downloadPhoto () {
    const { fileAssets, index } = this.state;
    if (index !== null) {
      const uri = fileAssets[index].s3location;
      console.log("downloading: ", uri);
      let fileUri = await Storage.get(uri)
	.then(result => console.log(result))
	.then(result => Alert.alert('Success!','Download complete'))
	.catch(err => console.log(error));
    } else {
      Alert.alert(
        'Oops',
        'Please select an Asset',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
        { cancelable: false },
      );
    }
  };

    render() {
	const { fileAssets, index, loading } = this.state;
	return (
	<View style={mystyles.container}>
		{loading && (
       			<View style={mystyles.spinner}>
       			<ActivityIndicator size="small" color="#FFFFFF" />
       			</View>
       		)}
	<SafeAreaView> 
	<Text style={{paddingTop: 10}}>Select asset & Press Download Asset</Text>
	<FlatList
	    data={fileAssets}
	    renderItem={({ item, index, separators }) => (
		<TouchableHighlight
      		    onPress={() => this.setIndex(index)}
      		    onShowUnderlay={separators.highlight}
           	    onHideUnderlay={separators.unhighlight}>
		    <Text style={ mystyles.item }>{item.name}</Text></TouchableHighlight>
	    )}
	    keyExtractor={item => item.id }
        />
        <View style={mystyles.container}>
          <Button
            title="Download Asset"
            style={{ backgroundColor: '#FF8C29' }}
            onPress={this.downloadPhoto.bind(this)}
          />
        </View>
	</SafeAreaView>
	</View>
	) //return
    }

}
, {
  includeGreetings: true,
});

const mystyles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
    alignItems: 'center',
  },
  spinner: {
    paddingVertical: 10,
  },
  item: {
	textAlign: 'center',
	fontSize: 20,
	borderWidth: 1,
  },
});
