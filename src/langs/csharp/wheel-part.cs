namespace A
{
  public static class Program
  {
    public static int feelingLucky()
    {
      var rnd = new System.Random();
      return rnd.Next(1, 101);
    }
  }
}