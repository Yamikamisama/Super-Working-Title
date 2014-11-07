get '/signup' do

  erb :"auth/signup"
end

post '/signup' do
  new_user = User.new(params[:new_user])
  if new_user.save
    session[:user_id] = new_user.id
    redirect '/'
  else
    set_error("Please enter valid password/username.")
    redirect '/signup'
  end
end

get '/login' do

  erb :"auth/login"
end

post '/login' do
  user = User.find_by(username: params[:username]).try(:authenticate, params[:password])
  if user
    session[:user_id] = user.id unless user.nil?
    redirect '/'
  else
    set_error("Log in failed: check username/password")
    redirect '/login'
  end

end

get '/logout' do
  session[:user_id] = nil

  redirect '/'
end