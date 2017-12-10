package wheelOfWasm;

import org.teavm.interop.Export;
import org.teavm.interop.Import;

public class WheelPart {

    // When returing a String from a name() method,
    // I cannot really read it from the linear memory,
    // as it gets some spaces inbetween.

    @Export(name = "feelingLucky")
    public static int feelingLucky() {
    	return (int)(WheelPart.random() * 100) + 1;
    }

    @Import(module = "env", name = "random")
    private static native double random();
}