// model connection
const UserModel=require('./models/user')

const typeDefs=`
    scalar Upload
    type Query{
        AllUser(page: Int , limit: Int): UserResult
        User(country: String) : [user]
        hello : String
    },
    type Mutation{
        registorUser(email: String!, username: String!, password: String!): Token!
        login(email: String!, password: String!) :Token!
        addArticle(title:String!,body:String!,photo:Upload): Article!
        changePass(email:String!,password:String!): user
    },
    type Article{
        title: String!
        body: String!
    },
    type Token{
        token:String
    },
    type UserResult{
        paginate:paginate
        Users:[user]
    },
    type paginate{
        total : Int
        limit : Int
        page : Int
        pages : Int
    },
    type user{
        name : String 
        email : String 
        numberrange :Int
        phone :String
        country : String
    }
`;
const resolvers={
    Query:{
        hello : ()=>{
            return "hello mohmmad"
        },
        AllUser : async(parent,args,{user})=> {
            let page=args.page || 1 ;
            let limit=args.limit || 5 ;
            if(!user){
                throw new Error("You must be login");
            }
            let users=await UserModel.paginate({},{page,limit})
            
            return{
                Users:users.docs,
                paginate:{
                    total:users.total,
                    limit:users.limit,
                    page:users.page,
                    pages:users.pages
                }
            }
        },
        User : async(parent,arg)=> await UserModel.find(arg)
    },
    Mutation :{
        registorUser: async(parent,{email,username,password},{api_secret_key})=>{
            let user= await UserModel.create({
                email,
                username,
                password: UserModel.hashPassword(password)
            })
            return {token: UserModel.createToken(user,api_secret_key,'2h') }
        },
        login: async(parent,{email,password},{api_secret_key})=>{
            let user= await UserModel.findOne({email});
            if(!user){
                console.log("dfsgfs")
                throw new Error("User Not Found!")
            }
            let isValid= await user.comparePassword(password)
            if(!isValid){
                console.log('adasd')
                throw new Error("Password Is Wrong!")
            }
            let token = await UserModel.createToken(user,api_secret_key,'2h')
            console.log(token)
            return {token }
        },
        addArticle: (parent,{title,body},{api_secret_key})=>{
            console.log(title,body)
            if(!user){
                throw new Error("You must be login");
            }
            return{title,body}
        },
        changePass: async(parent,{email,password})=>{
            password= UserModel.hashPassword(password)
            await UserModel.findOneAndUpdate({email},{password})
            return {
                user:{
                    email
                }
            }
        }
    }
}

module.exports={typeDefs,resolvers}