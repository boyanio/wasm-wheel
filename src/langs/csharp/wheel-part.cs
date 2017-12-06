using System;

namespace WheelOfWasm
{
  public static class Program
  {
    public static int feelingLucky()
    {
      var rnd = new Random();
      return rnd.Next(1, 101);
    }
  }
}