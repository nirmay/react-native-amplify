import React from 'react'
import { StyleSheet, Text, SafeAreaView, Dimensions, View, FlatList, TouchableHighlight, Alert, ActivityIndicator, Image } from 'react-native'

import Amplify, { Storage, Analytics, API, graphqlOperation } from "aws-amplify"
import { withAuthenticator } from 'aws-amplify-react-native'
import config from "./aws-exports"
import { createFileAsset } from "./src/graphql/mutations"
import { listFileAssets } from "./src/graphql/queries"
import Button from './Button';
import Constants from 'expo-constants';

Amplify.configure(config)
const width = Dimensions.get("window").width;
const iconChecked = require("./checked.png");

// Helper function that converts bytes read from S3 into String.
var utf8Array = function (array) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = array.length;
    i = 0;
    while (i < len) {
        c = array[i++];
        switch (c >> 4) {
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c);
                break;
            case 12: case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++];
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++];
                char3 = array[i++];
                out += String.fromCharCode(((c & 0x0F) << 12) |
                    ((char2 & 0x3F) << 6) |
                    ((char3 & 0x3F) << 0));
                break;
        }
    }
    Alert.alert('Downloaded File content:', out);
    console.log("downloaded file:" + out);
  }

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
      let fileUri = await Storage.get(uri, { download: true})
	.then(result => utf8Array(result.Body))
	.catch(err => console.log(err));
    } else {
      Alert.alert(
        'Oops',
        'Please select an Asset',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
        { cancelable: false },
      );
    }
  };

    renderSeparator = () => {
    return (<View style={{height: 1, width: "96%", backgroundColor: "#CED0CE", marginLeft: "2%"}}/>);
    };
    renderHeader = () => {
    return (<Text style={{paddingTop: 10}}>Select asset & Press Download Asset</Text>);
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
	
	<FlatList
	    data={fileAssets}
	    renderItem={({ item, index, separators }) => (
		<TouchableHighlight
		    style={mystyles.boxSelect}
      		    onPress={() => this.setIndex(index)}
      		    onShowUnderlay={separators.highlight}
           	    onHideUnderlay={separators.unhighlight}>
		    <View style={mystyles.contentChecked}>
		    <Text style={ mystyles.item }>{item.name}</Text>
		    {this.state.index === index && <Image source={iconChecked} style={mystyles.iconChecked}/>}
		    </View></TouchableHighlight>
	    )}
	    keyExtractor={item => item.id }
	    ItemSeparatorComponent={this.renderSeparator}
	    ListHeaderComponent={this.renderHeader}
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
  boxSelect: {
		justifyContent: 'flex-start',
		alignContent: 'center',
		borderRadius: 5,
		paddingLeft: 10,
		width: width - 40
	},
	contentChecked: {
		justifyContent: 'space-between',
		alignItems: 'center',
		height: '100%',
		flexDirection: 'row'
	},

	iconChecked: {
		marginRight: 20
	},
  item: {
	textAlign: 'center',
	fontSize: 18,
  },
});
