

-- select row_number, theday, aapl, msft, goog from 
-- (select row_number() over (order by theday desc), theday, aapl, msft, goog from pastprice) as madeup
-- where row_number in (1, 2, 3, 4, 5, 6, 10, 15, 22, 43, 65, 130, 250, 500);


-- create table hourlyprice(
--     stock varchar(5) primary key,
--     h1 real,
--     h2 real,
--     h3 real,
--     h4 real,
--     h5 real,
--     h6 real,
--     h7 real
-- );


-- create table price(
--     stock varchar(5) primary key,
--     price real,
--     pe real,
--     marketcap bigint,
--     w52h real,
--     w52l real,
--     ytd real
-- );

-- create table userinfo(
--     userid serial primary key,
--     email varchar(50),
--     username varchar(50),
--     pass varchar(200),
--     botfile varchar(50)
-- );

-- create table portfolio(
--     tradeid bigserial primary key,
--     userid integer references userinfo(userid),
--     stock varchar(5),
--     buydate date,
--     amount int,
--     buyprice real
-- );

-- create table leaderboard(
--     position smallint primary key,
--     userid integer references userinfo(userid)
-- );

-- create table usersessions(
--     random_string varchar(200) primary key,
--     user_id integer references userinfo(userid)
-- );
