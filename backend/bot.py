# all discord bot related code
import discord, dotenv, os
from vars import *
from discord.ext import commands
dotenv.load_dotenv()

intents = discord.Intents.default()
intents.members = True
intents.message_content = True
bot = commands.Bot(command_prefix='.', intents=intents)

@bot.event
async def on_ready():
    print(f"{bot.user} running!")
    
@bot.command(brief="Check if bot is online", aliases=["test"])
async def ping(ctx: commands.Context):
    user = bot.get_user(749431660168216650)
    if user is not None: await createOffer(1540, "hoodie", 1, "m", 2025, user)
    await createEmbed(ctx, "Pong!", ctx.author, reply=True)

async def createOffer(team: int, type: str, nam: int, size:str, year: int, user: discord.User | discord.Member):
    message = f"**Team: {team}\nItem: {type}**\nNAM: {nam}\nSize: {size}\nYear: {year}"
    channel = bot.fetch_channel(offersChannel)
    await channelEmbed(channel, message, user)
    
async def channelEmbed(channel, message: str, usr: discord.User | discord.Member, type:int =0):
    if type == 0: color = discord.Color.blurple()
    elif type > 0: color = discord.Color.green()
    else: color = discord.Color.red()
    embed = discord.Embed(color=color)
    embed.set_author(name=usr.display_name, icon_url=usr.display_avatar)
    embed.description = message
    await channel.send(embed=embed)


async def createEmbed(ctx: commands.Context, message: str, usr: discord.User | discord.Member, type:int =0, reply: bool = False):
    if type == 0: color = discord.Color.blurple()
    elif type > 0: color = discord.Color.green()
    else: color = discord.Color.red()
    embed = discord.Embed(color=color)
    embed.set_author(name=usr.display_name, icon_url=usr.display_avatar)
    embed.description = message
    if not reply: await ctx.send(embed=embed)
    else: await ctx.reply(embed=embed)

def init():
    """Starts Discord bot for use

    Raises:
        ValueError: when there is no discord token in .env
    """
    token = os.getenv('discord_token')
    if token is None: raise ValueError("Environment variable 'discord_token' is not set.")
    else: bot.run(token)
    

init()