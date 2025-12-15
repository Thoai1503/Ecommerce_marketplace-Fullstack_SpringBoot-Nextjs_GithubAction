package docker_test.com.services;

import org.springframework.stereotype.Service;

@Service
public class TestSingleton {
    private int counter = 5;

	public void incrementCounter() {
		counter++;
	}

	public int getCounter() {
		return counter;
	}
}
