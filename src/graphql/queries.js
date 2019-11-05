/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getFileAsset = `query GetFileAsset($id: ID!) {
  getFileAsset(id: $id) {
    id
    name
    s3location
  }
}
`;
export const listFileAssets = `query ListFileAssets(
  $filter: ModelFileAssetFilterInput
  $limit: Int
  $nextToken: String
) {
  listFileAssets(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      name
      s3location
    }
    nextToken
  }
}
`;
