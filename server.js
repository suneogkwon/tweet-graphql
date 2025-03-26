import {ApolloServer, gql} from "apollo-server";

let tweets = [
    {
        id: "1",
        text: 'Hello world!',
        userId: "2",
    },
    {
        id: "2",
        text: 'Hello world 2!',
        userId: "1",
    }
];

let users = [
    {
        id: '1',
        username: 'john',
        firstName: 'John',
        lastName: 'Doe'
    },
    {
        id: '2',
        username: 'jane',
        firstName: 'Jane',
        lastName: 'Doe'
    },
    {
        id: '3',
        username: 'jim',
        firstName: 'Jim',
        lastName: 'Doe'
    }
];

const typeDefs = gql`
    type User {
        id:ID!
        username:String!
        firstName:String!
        lastName:String!
        """
        The sum of firstName and lastName
        """
        fullName:String!
    }
    """
    Tweet object represents a resource for a Tweet
    """
    type Tweet {
        id:ID!
        text:String!
        author:User!
    }
    type Movie {
        id: Int!
        url: String!
        imdb_code: String!
        title: String!
        title_english: String!
        title_long: String!
        slug: String!
        year: Int!
        rating: Float!
        runtime: Float!
        genres: [String]!
        summary: String
        description_full: String!
        synopsis: String
        yt_trailer_code: String!
        language: String!
        background_image: String!
        background_image_original: String!
        small_cover_image: String!
        medium_cover_image: String!
        large_cover_image: String!
    }

    type Query {
        allUsers: [User!]!
        allTweets: [Tweet!]!
        tweet(id: ID!): Tweet
        allMovies: [Movie!]!
        movie(id: String!): Movie!
    }
    type Mutation {
        postTweet(text: String!, userId: ID!): Tweet!
        """
        Deletes a Tweet by its ID.
        Returns true if the deletion was successful, false otherwise.
        """
        deleteTweet(id: ID!): Boolean!
    }
`;

const resolvers = {
    Query: {
        allTweets: () => tweets,
        tweet: (_, {id}) => tweets.find(tweet => tweet.id === id),
        allUsers: () => users,
        allMovies: () => {
            return fetch('https://yts.mx/api/v2/list_movies.json')
                .then(response => response.json())
                .then(json => json.data.movies);
        },
        movie: (_, {id}) => {
            return fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`)
                .then(response => response.json())
                .then(json => json.data.movie);
        }
    },
    Mutation: {
        postTweet: (_, {text, userId}) => {
            const tweet = {
                id: (tweets.length + 1).toString(),
                text,
                author: {
                    id: userId,
                    username: 'john',
                    firstName: 'John',
                    lastName: 'Doe'
                }
            };
            tweets.push(tweet);

            return tweet;
        },
        deleteTweet: (_, {id}) => {
            const index = tweets.findIndex(tweet => tweet.id === id);
            if (index === -1) {
                return false;
            }

            tweets = tweets.toSpliced(index, 1);

            return true;
        }
    },
    User: {
        fullName: ({firstName, lastName}) => `${firstName} ${lastName}`,
    },
    Tweet: {
        author: ({userId}) => users.find(user => user.id === userId),
    }
}

const server = new ApolloServer({typeDefs, resolvers});

server.listen().then(({url}) => {
    console.log('Running on ' + url);
});