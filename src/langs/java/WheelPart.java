package wheelOfWasm;

import org.teavm.interop.Export;

public class WheelPart {

    @Export(name = "name")
    public String name() {
    	return "Java";
    }

    @Export(name = "feelingLucky")
    public int feelingLucky() {
    	return (int)(Math.random() * 100) + 1;
    }
}